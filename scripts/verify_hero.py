#!/usr/bin/env python3
"""Durable Playwright verification for the living-yard hero (plan Task 19).

Recommended invocation on this machine — production export beats dev: no HMR,
no dev overlay, real lazy-chunk boundaries.

    cd next-app && npm run build
    (cd next-app && npx --yes serve out -l 5299 &)
    python3 scripts/verify_hero.py --base-url http://localhost:5299

Dev alternative (server already running on 5182):

    python3 scripts/verify_hero.py

Usage:
    python3 scripts/verify_hero.py [--base-url URL] [--shots DIR] [--only a,b,c]

Checks (12, all independent; fresh browser context where needed):
    1  home_ssr_copy       raw HTML contains the tag-split headline
    2  canvas_mounts       canvas ≈ viewport, 0 console errors, settles ≤ 12 s
    3  scrub_releases      mid-track scrub + sticky release to next section
    4  skip_works          skip during the dive → settled, copy visible
    5  revisit_quick       same-context reload → p ≥ 0.7 ≤ 4 s, settled ≤ 5 s
    6  reduced_motion      settled instantly, copy visible, cursor hidden
    7  no_webgl            --disable-webgl → SVG fallback, no canvas, 0 errors
    8  model_failure       aborted GLBs → scene renders, filtered errors 0
    9  cursor_fixture      scan box + waybill tag + Scanned stamp + clear
    10 yard_hover          3D truck raycast → SHV-TRK waybill, clears on exit
    11 mobile_390          390×844: canvas, no h-overflow, 0 console errors
    12 other_routes_clean  /services: 0 errors, no home-late hero chunks

Exit code is non-zero if any check fails. Screenshots land in --shots for
checks 2, 3, 6, 7 and 11. See also docs/superpowers/plans/
2026-10-05-living-yard-hero-plan.md (Task 19).
"""

from __future__ import annotations

import argparse
import re
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any, Callable

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import Page, sync_playwright

DESKTOP = {"width": 1440, "height": 900}
MOBILE = {"width": 390, "height": 844}
SETTLE_BUDGET_S = 12.0
# Expected network noise when a model request is deliberately aborted.
NET_NOISE = re.compile(r"Failed to fetch|ERR_FAILED|Could not load", re.IGNORECASE)
CURSOR_SELECTORS = (
    ".cursor-follow",
    ".cursor-stamp-el",
    ".cursor-waybill",
    ".cursor-scanbox",
)
# Byte markers that identify the lazily-loaded hero bundle (three.js / R3F
# scene / progress hook). Used by check 12 to separate real hero chunks from
# route chunks Next preloads for the navbar links (which do load on /services).
HERO_CHUNK_MARKERS = (
    b"WebGLRenderer",
    b"setThreeWaybill",
    b"getAgentScreenPosition",
    b"hero-canvas-wrap",
)


# --------------------------------------------------------------------------- #
# plumbing
# --------------------------------------------------------------------------- #


class ConsoleErrors:
    """Collects console errors + uncaught page errors for one page."""

    def __init__(self, page: Page) -> None:
        self.raw: list[str] = []
        page.on("console", self._on_console)
        page.on("pageerror", self._on_pageerror)

    def _on_console(self, msg: Any) -> None:
        if msg.type == "error":
            self.raw.append(msg.text)

    def _on_pageerror(self, err: Any) -> None:
        self.raw.append(f"pageerror: {err}")

    def filtered(self) -> list[str]:
        return [e for e in self.raw if not NET_NOISE.search(e)]


class Ctx:
    """Shared handles for every check: playwright, browser, urls, shots."""

    def __init__(self, pw: Any, browser: Any, base_url: str, shots: str) -> None:
        self.pw = pw
        self.browser = browser
        self.base_url = base_url.rstrip("/")
        self.shots = Path(shots)

    def open(self, *, viewport: dict | None = None, **kwargs: Any):
        context = self.browser.new_context(viewport=viewport or DESKTOP, **kwargs)
        page = context.new_page()
        page.set_default_timeout(20000)
        errors = ConsoleErrors(page)
        return context, page, errors

    def shot(self, page: Page, name: str) -> None:
        self.shots.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(self.shots / name))


def goto(page: Page, url: str, wait_until: str = "domcontentloaded") -> None:
    page.goto(url, wait_until=wait_until, timeout=30000)


def wait_hook(page: Page, timeout: int = 15000) -> None:
    page.wait_for_function("() => !!window.__slHero", timeout=timeout)


def hero_state(page: Page) -> dict | None:
    return page.evaluate("() => window.__slHero && window.__slHero.getState()")


def wait_phase(page: Page, budget_s: float, phase: str = "settled"):
    """Poll the hero hook until `phase` (or budget). Returns (ok, elapsed, state)."""
    t0 = time.monotonic()
    state = hero_state(page)
    while time.monotonic() - t0 < budget_s:
        state = hero_state(page)
        if state and state.get("phase") == phase:
            return True, time.monotonic() - t0, state
        page.wait_for_timeout(150)
    return False, time.monotonic() - t0, state


def wait_preloader_gone(page: Page, timeout: int = 10000) -> None:
    page.wait_for_function(
        "() => { const el = document.querySelector('.preloader');"
        " return !el || getComputedStyle(el).display === 'none'; }",
        timeout=timeout,
    )


def one_line(text: str) -> str:
    return " / ".join(part.strip() for part in text.splitlines() if part.strip())


# --------------------------------------------------------------------------- #
# checks
# --------------------------------------------------------------------------- #


def check_home_ssr_copy(ctx: Ctx) -> tuple[bool, str]:
    url = ctx.base_url + "/"
    with urllib.request.urlopen(url, timeout=20) as resp:
        raw = resp.read().decode("utf-8", "replace")
    # SplitReveal wraps each word in its own span — compare tag-stripped text.
    text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", raw))
    ok = "Customs brokerage with integrity" in text
    return ok, (
        f"GET / → {len(raw) // 1024} KB SSR HTML; tag-stripped headline "
        f"{'found' if ok else 'MISSING'}"
    )


def check_canvas_mounts(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open()
    try:
        t0 = time.monotonic()
        goto(page, ctx.base_url + "/")
        wait_hook(page)
        page.wait_for_selector(".hero-canvas-wrap canvas", timeout=12000)
        ok, elapsed, state = wait_phase(page, SETTLE_BUDGET_S - (time.monotonic() - t0))
        box = page.locator(".hero-canvas-wrap canvas").first.bounding_box()
        vw, vh = page.evaluate("[window.innerWidth, window.innerHeight]")
        size_ok = (
            box is not None
            and abs(box["width"] - vw) <= 4
            and abs(box["height"] - vh) <= 4
        )
        errs = errors.filtered()
        ctx.shot(page, "02-canvas-settled.png")
        total = time.monotonic() - t0
        ok = bool(ok and size_ok and not errs and total <= SETTLE_BUDGET_S)
        box_txt = f"{box['width']:.0f}x{box['height']:.0f}" if box else "none"
        phase = state.get("phase") if state else "missing"
        progress = state.get("progress", -1) if state else -1
        return ok, (
            f"canvas {box_txt} vs viewport {vw}x{vh}; phase={phase} "
            f"p={progress:.3f} at {total:.1f}s (budget {SETTLE_BUDGET_S:.0f}s); "
            f"console errors={len(errs)}"
        )
    finally:
        context.close()


def check_scrub_releases(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open()
    try:
        goto(page, ctx.base_url + "/")
        wait_hook(page)
        m = page.evaluate(
            """() => {
                const t = document.querySelector('.hero-track');
                const r = t.getBoundingClientRect();
                return { top: r.top + window.scrollY, height: r.height,
                         vh: window.innerHeight };
            }"""
        )
        mid = round(m["top"] + (m["height"] - m["vh"]) * 0.5)
        page.evaluate(f"window.scrollTo(0, {mid})")
        # The hook registers its listener with the test hook; nudge in case the
        # scroll fired first.
        deadline = time.monotonic() + 5
        state, sticky = None, None
        while time.monotonic() < deadline:
            state = hero_state(page)
            sticky = page.evaluate(
                "document.querySelector('.hero-sticky').getBoundingClientRect().top"
            )
            if state and state["progress"] > 0.05 and abs(sticky) <= 2:
                break
            page.evaluate("window.dispatchEvent(new Event('scroll'))")
            page.wait_for_timeout(150)
        mid_ok = bool(state) and state["progress"] > 0.05 and abs(sticky) <= 2
        ctx.shot(page, "03-scrub-release.png")

        past = round(m["top"] + m["height"] + 24)
        page.evaluate(f"window.scrollTo(0, {past})")
        page.wait_for_timeout(500)
        next_top = page.evaluate(
            """() => {
                const t = document.querySelector('.hero-track');
                const sec = t.closest('section') || t.parentElement;
                const n = sec.nextElementSibling;
                return n ? n.getBoundingClientRect().top : null;
            }"""
        )
        next_ok = next_top is not None and next_top < m["vh"]
        errs = errors.filtered()
        ok = bool(mid_ok and next_ok and not errs)
        p = state["progress"] if state else -1
        return ok, (
            f"mid-track p={p:.3f} stickyTop={sticky:.1f}px (want >0.05, |top|≤2); "
            f"past-track nextTop={next_top} < vh {m['vh']}; console errors={len(errs)}"
        )
    finally:
        context.close()


def check_skip_works(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open()
    try:
        goto(page, ctx.base_url + "/")
        wait_hook(page)
        wait_preloader_gone(page)
        page.wait_for_function(
            "() => { const s = window.__slHero && window.__slHero.getState();"
            " return s && s.phase === 'dive'; }",
            timeout=8000,
        )
        before = hero_state(page) or {}
        page.click(".hero-skip")
        ok, elapsed, state = wait_phase(page, 5.0)
        page.wait_for_timeout(900)  # copy opacity transition
        copy_visible = page.locator(".hero-copy").is_visible()
        opacity = page.evaluate(
            "parseFloat(getComputedStyle(document.querySelector('.hero-copy')).opacity)"
        )
        errs = errors.filtered()
        ok = bool(ok and copy_visible and opacity > 0.9 and not errs)
        return ok, (
            f"clicked at p={before.get('progress', -1):.3f} phase="
            f"{before.get('phase')}; settled in {elapsed:.1f}s; copy visible="
            f"{copy_visible} opacity={opacity}; console errors={len(errs)}"
        )
    finally:
        context.close()


def check_revisit_quick(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open()
    try:
        goto(page, ctx.base_url + "/")
        page.wait_for_function(
            "() => { try { return sessionStorage.getItem('sl-seen') === '1'; }"
            " catch { return false; } }",
            timeout=10000,
        )
        t0 = time.monotonic()
        page.reload(wait_until="domcontentloaded")
        wait_hook(page, timeout=8000)
        progress_at = settled_at = None
        state = None
        while time.monotonic() - t0 < 5.0:
            state = hero_state(page)
            if state:
                if progress_at is None and state["progress"] >= 0.7:
                    progress_at = time.monotonic() - t0
                if state["phase"] == "settled":
                    settled_at = time.monotonic() - t0
                    break
            page.wait_for_timeout(100)
        errs = errors.filtered()
        ok = bool(
            progress_at is not None
            and progress_at <= 4.0
            and settled_at is not None
            and settled_at <= 5.0
            and not errs
        )
        p_txt = f"{progress_at:.2f}s" if progress_at is not None else "MISS"
        s_txt = f"{settled_at:.2f}s" if settled_at is not None else "MISS"
        return ok, (
            f"reload (sl-seen set) → p≥0.7 at {p_txt} (≤4s), settled at {s_txt} "
            f"(≤5s); console errors={len(errs)}"
        )
    finally:
        context.close()


def check_reduced_motion(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open(reduced_motion="reduce")
    try:
        t0 = time.monotonic()
        goto(page, ctx.base_url + "/")
        wait_hook(page, timeout=8000)
        ok, elapsed, state = wait_phase(page, 3.0)
        page.wait_for_timeout(400)
        copy_visible = page.locator(".hero-copy").is_visible()
        opacity = page.evaluate(
            "parseFloat(getComputedStyle(document.querySelector('.hero-copy')).opacity)"
        )
        skip_count = page.locator(".hero-skip").count()
        cursor_visible = {
            sel: page.locator(sel).is_visible() for sel in CURSOR_SELECTORS
        }
        errs = errors.filtered()
        ctx.shot(page, "06-reduced-motion.png")
        phase = state.get("phase") if state else "missing"
        progress = state.get("progress", -1) if state else -1
        ok = bool(
            ok
            and phase == "settled"
            and progress >= 1
            and copy_visible
            and opacity > 0.9
            and skip_count == 0
            and not any(cursor_visible.values())
            and not errs
        )
        hidden = ",".join(sel for sel, vis in cursor_visible.items() if not vis)
        shown = ",".join(sel for sel, vis in cursor_visible.items() if vis)
        return ok, (
            f"phase={phase} p={progress:.2f} at {time.monotonic() - t0:.1f}s; copy "
            f"visible={copy_visible} opacity={opacity}; skip buttons={skip_count}; "
            f"cursor hidden [{hidden or 'none'}] visible [{shown or 'none'}]; "
            f"console errors={len(errs)}"
        )
    finally:
        context.close()


def check_no_webgl(ctx: Ctx) -> tuple[bool, str]:
    # Fresh browser: --disable-webgl cannot be undone on an existing one.
    browser = ctx.pw.chromium.launch(args=["--disable-webgl", "--disable-gpu"])
    try:
        context = browser.new_context(viewport=DESKTOP)
        page = context.new_page()
        page.set_default_timeout(20000)
        errors = ConsoleErrors(page)
        goto(page, ctx.base_url + "/")
        page.wait_for_selector(".yard-fallback svg", state="visible", timeout=12000)
        page.wait_for_timeout(800)
        fallback_visible = page.locator(".yard-fallback svg").is_visible()
        canvas_count = page.locator("canvas").count()
        errs = errors.filtered()
        ctx.shot(page, "07-no-webgl.png")
        ok = bool(fallback_visible and canvas_count == 0 and not errs)
        return ok, (
            f".yard-fallback svg visible={fallback_visible}; canvas count="
            f"{canvas_count}; console errors={len(errs)}"
        )
    finally:
        browser.close()


def check_model_failure(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open()
    try:
        page.route("**/models/*.glb", lambda route: route.abort())
        goto(page, ctx.base_url + "/")
        wait_hook(page)
        page.wait_for_selector(".hero-canvas-wrap canvas", timeout=12000)
        ok, elapsed, state = wait_phase(page, SETTLE_BUDGET_S)
        canvas_count = page.locator(".hero-canvas-wrap canvas").count()
        fallback_count = page.locator(".yard-fallback").count()
        errs = errors.filtered()
        phase = state.get("phase") if state else "missing"
        ok = bool(ok and canvas_count >= 1 and fallback_count == 0 and not errs)
        return ok, (
            f"canvas={canvas_count} procedural scene, fallback={fallback_count}; "
            f"phase={phase} at {elapsed:.1f}s; raw network noise={len(errors.raw)} "
            f"filtered errors={len(errs)}"
        )
    finally:
        context.close()


def check_cursor_fixture(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open()
    try:
        goto(page, ctx.base_url + "/")
        wait_hook(page)
        wait_preloader_gone(page)
        wait_phase(page, SETTLE_BUDGET_S)  # settled copy = safe "away" target
        page.evaluate(
            """() => {
                const d = document.createElement('button');
                d.id = 'cursor-fixture';
                d.setAttribute('data-scan', '');
                d.setAttribute('data-waybill', JSON.stringify({
                    id: 'SHV-999', label: 'Fixture Cargo',
                    route: 'LDH → MUNDRA', eta: '24H',
                }));
                d.setAttribute('data-stamp', 'scanned');
                d.textContent = 'fixture';
                d.style.cssText =
                    'position:fixed;top:200px;left:200px;z-index:99;padding:20px';
                document.body.appendChild(d);
            }"""
        )
        page.hover("#cursor-fixture")
        page.wait_for_timeout(350)
        tag_on = page.locator(".cursor-waybill.is-on").count()
        tag_text = one_line(page.locator(".cursor-waybill").inner_text()) if tag_on else ""
        scan_on = page.locator(".cursor-scanbox.is-on").count()

        page.mouse.down()
        page.mouse.up()
        page.wait_for_timeout(250)
        stamp_text = page.locator(".cursor-stamp-el").inner_text().strip()
        stamp_variant = page.locator(".cursor-stamp-el").get_attribute("data-variant")

        # Move away over the settled copy block (DOM overlay above the canvas).
        para = page.locator(".hero-copy-block p").first.bounding_box()
        page.mouse.move(para["x"] + para["width"] / 2, para["y"] + para["height"] / 2)
        page.wait_for_timeout(350)
        cleared = page.locator(".cursor-waybill.is-on").count() == 0

        errs = errors.filtered()
        ok = bool(
            tag_on == 1
            and "SHV-999" in tag_text
            and scan_on == 1
            and stamp_text == "Scanned"
            and stamp_variant == "scanned"
            and cleared
            and not errs
        )
        return ok, (
            f"hover tag.on={tag_on} scanbox.on={scan_on} tag='{tag_text[:60]}'; "
            f"stamp='{stamp_text}' variant={stamp_variant}; cleared-after-move="
            f"{cleared}; console errors={len(errs)}"
        )
    finally:
        context.close()


def check_yard_hover(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open()
    try:
        goto(page, ctx.base_url + "/")
        wait_hook(page)
        wait_phase(page, SETTLE_BUDGET_S)
        hit = False
        last_pos = None
        attempts = 0
        for i in range(6):
            attempts = i + 1
            pos = page.evaluate("() => window.__slHero.getAgentScreenPosition('truck-1')")
            if not pos:
                page.wait_for_timeout(250)
                continue
            last_pos = pos
            page.mouse.move(pos["x"], pos["y"])
            page.wait_for_timeout(350)
            tag = page.locator(".cursor-waybill.is-on")
            if tag.count() == 1 and "SHV-TRK" in tag.inner_text():
                hit = True
                break
            page.wait_for_timeout(150)

        cleared = False
        if hit:
            para = page.locator(".hero-copy-block p").first.bounding_box()
            page.mouse.move(
                para["x"] + para["width"] / 2, para["y"] + para["height"] / 2
            )
            page.wait_for_timeout(400)
            cleared = page.locator(".cursor-waybill.is-on").count() == 0

        errs = errors.filtered()
        ok = bool(hit and cleared and not errs)
        pos_txt = (
            f"({last_pos['x']:.0f},{last_pos['y']:.0f})" if last_pos else "null"
        )
        return ok, (
            f"truck-1 {'hit' if hit else 'MISS'} after {attempts} tries, last "
            f"pos={pos_txt} → tag contains SHV-TRK; cleared-after-move={cleared}; "
            f"console errors={len(errs)}"
        )
    finally:
        context.close()


def check_mobile_390(ctx: Ctx) -> tuple[bool, str]:
    context, page, errors = ctx.open(viewport=MOBILE)
    try:
        goto(page, ctx.base_url + "/")
        page.wait_for_selector(".hero-canvas-wrap canvas", timeout=15000)
        page.wait_for_timeout(600)
        canvas_visible = page.locator(".hero-canvas-wrap canvas").first.is_visible()
        scroll_w = page.evaluate("document.documentElement.scrollWidth")
        inner_w = page.evaluate("window.innerWidth")
        errs = errors.filtered()
        ctx.shot(page, "11-mobile-390.png")
        ok = bool(canvas_visible and scroll_w <= 390 and not errs)
        return ok, (
            f"canvas visible={canvas_visible}; doc scrollWidth={scroll_w} "
            f"(viewport {inner_w}, limit 390); console errors={len(errs)}"
        )
    finally:
        context.close()


def check_other_routes_clean(ctx: Ctx) -> tuple[bool, str]:
    # 1 · home: JS requested after the load event = lazy chunks + route prefetch.
    context, page, _ = ctx.open()
    late_home: set[str] = set()
    try:
        load_done = {"v": False}

        def on_home_request(req: Any) -> None:
            if (
                load_done["v"]
                and req.resource_type == "script"
                and req.url.endswith(".js")
            ):
                late_home.add(req.url)

        page.on("request", on_home_request)
        goto(page, ctx.base_url + "/", wait_until="load")
        load_done["v"] = True
        wait_hook(page)
        wait_phase(page, SETTLE_BUDGET_S)
        page.wait_for_timeout(1200)
    finally:
        context.close()

    # 2 · /services: every script request + console errors.
    context2, page2, errors2 = ctx.open()
    services_js: set[str] = set()
    try:

        def on_services_request(req: Any) -> None:
            if req.resource_type == "script" and req.url.endswith(".js"):
                services_js.add(req.url)

        page2.on("request", on_services_request)
        goto(page2, ctx.base_url + "/services", wait_until="load")
        page2.wait_for_timeout(2500)
        try:
            page2.wait_for_load_state("networkidle", timeout=10000)
        except PlaywrightError:
            pass
        errs = errors2.filtered()
    finally:
        context2.close()

    # 3 · keep only genuine hero chunks: Next preloads other routes' chunks for
    # the always-visible navbar links, and those legitimately load on /services.
    hero_late: dict[str, bytes] = {}
    for url in sorted(late_home):
        try:
            with urllib.request.urlopen(url, timeout=20) as resp:
                body = resp.read()
        except Exception:  # noqa: BLE001 — unreadable chunk is simply skipped
            continue
        if any(marker in body for marker in HERO_CHUNK_MARKERS):
            hero_late[url] = body

    overlap = set(hero_late) & services_js
    has_three = any(b"WebGLRenderer" in body for body in hero_late.values())
    names = ", ".join(
        f"{Path(u).name} ({len(b) // 1024} KB)" for u, b in list(hero_late.items())[:3]
    )
    ok = bool(hero_late and has_three and not overlap and not errs)
    return ok, (
        f"late-on-/ JS={len(late_home)}; hero-verified={len(hero_late)} "
        f"[{names or 'none'}]; three.js chunk present={has_three}; /services "
        f"JS={len(services_js)}; overlap={len(overlap)}; /services console "
        f"errors={len(errs)}"
    )


# --------------------------------------------------------------------------- #
# runner
# --------------------------------------------------------------------------- #

CHECKS: list[tuple[str, Callable[[Ctx], tuple[bool, str]]]] = [
    ("home_ssr_copy", check_home_ssr_copy),
    ("canvas_mounts", check_canvas_mounts),
    ("scrub_releases", check_scrub_releases),
    ("skip_works", check_skip_works),
    ("revisit_quick", check_revisit_quick),
    ("reduced_motion", check_reduced_motion),
    ("no_webgl", check_no_webgl),
    ("model_failure", check_model_failure),
    ("cursor_fixture", check_cursor_fixture),
    ("yard_hover", check_yard_hover),
    ("mobile_390", check_mobile_390),
    ("other_routes_clean", check_other_routes_clean),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Durable Playwright verification for the living-yard hero."
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:5182",
        help="Server under test (default http://localhost:5182).",
    )
    parser.add_argument(
        "--shots",
        default="/tmp/opencode/hero-verify",
        help="Screenshot output directory (default /tmp/opencode/hero-verify).",
    )
    parser.add_argument(
        "--only",
        default=None,
        help="Comma-separated subset of check names to run.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    only = (
        [name.strip() for name in args.only.split(",") if name.strip()]
        if args.only
        else None
    )
    if only:
        known = {name for name, _ in CHECKS}
        unknown = [name for name in only if name not in known]
        if unknown:
            print(f"unknown check(s): {', '.join(unknown)}", file=sys.stderr)
            print(f"known checks: {', '.join(known)}", file=sys.stderr)
            return 2
    selected = [(n, fn) for n, fn in CHECKS if not only or n in only]

    print(f"verify_hero — {args.base_url} → shots {args.shots}")
    results: list[tuple[str, bool, str]] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        ctx = Ctx(pw, browser, args.base_url, args.shots)
        try:
            for name, fn in selected:
                t0 = time.monotonic()
                try:
                    ok, evidence = fn(ctx)
                except Exception as exc:  # noqa: BLE001 — report, keep going
                    first = one_line(str(exc))[:180]
                    ok, evidence = False, f"exception {type(exc).__name__}: {first}"
                dt = time.monotonic() - t0
                results.append((name, ok, evidence))
                print(
                    f"{'PASS' if ok else 'FAIL'} {name} — {evidence} ({dt:.1f}s)",
                    flush=True,
                )
        finally:
            browser.close()

    failed = [name for name, ok, _ in results if not ok]
    print()
    print(
        f"{len(results) - len(failed)}/{len(results)} checks passed"
        + (f"; failed: {', '.join(failed)}" if failed else "")
    )
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
