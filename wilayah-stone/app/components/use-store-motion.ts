'use client';

import {useEffect} from 'react';

const revealTargets = [
  '.section-heading', '.products > .product', '.contact-channels > .contact-channel',
  '.journal-grid > .journal-card', '.stone-categories > button', '.editorial-band',
  '.stone-studio .studio-layout', '.craft-intro', '.craft-content', '.detail-guides > div',
  '.account-invite > div', '.account-invite > .primary', '.engraving-banner > div',
  '.values-strip > span', '.policy > h1', '.policy > .policy-summary', '.policy-section',
  '.policy-help', '.form-panel', '.footer-top > div', '.footer-bottom', '.launch-card',
  '.account-grid > *', '.product-page-grid > div',
].join(',');

export function useStoreMotion(page:string) {
  useEffect(() => {
    const root = document.getElementById('main-content');
    if (!root || page === 'admin') return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prepared = new Set<HTMLElement>();
    let observer:IntersectionObserver|undefined;
    let mutations:MutationObserver|undefined;
    let pointerFocus = false;

    function onPointerDown() {pointerFocus = true;}
    function onKeyDown() {pointerFocus = false;}

    function settle(el:HTMLElement) {
      el.dataset.motion = 'settled';
      observer?.unobserve(el);
    }

    function onFocus(event:FocusEvent) {
      // Cancelling a reveal between pointer-down and pointer-up moves its hit area.
      // Keyboard focus can settle immediately; pointer focus lets the reveal finish.
      if (pointerFocus) return;
      let el = event.target instanceof HTMLElement ? event.target : null;
      while (el && el !== root) {
        if (prepared.has(el)) settle(el);
        el = el.parentElement;
      }
    }

    function onAnimationEnd(event:AnimationEvent) {
      const el = event.target;
      if (event.animationName === 'ws-rise' && el instanceof HTMLElement && prepared.has(el)) settle(el);
    }

    function reset() {
      observer?.disconnect();
      mutations?.disconnect();
      for (const el of prepared) {
        el.removeAttribute('data-motion');
        el.style.removeProperty('--reveal-delay');
      }
      prepared.clear();
    }

    function configure() {
      reset();
      if (preference.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (el.dataset.motion !== 'settled') el.dataset.motion = 'revealed';
          observer?.unobserve(el);
        }
      }, {threshold:0.08, rootMargin:'0px 0px -20px 0px'});

      function prepare(el:HTMLElement) {
        if (prepared.has(el)) return;
        prepared.add(el);
        // Waiting content remains visible; motion never gates access to content.
        el.dataset.motion = 'waiting';
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        el.style.setProperty('--reveal-delay', `${Math.max(0,siblings.indexOf(el)) % 4 * 55}ms`);
        observer?.observe(el);
      }

      root!.querySelectorAll<HTMLElement>(revealTargets).forEach(prepare);
      mutations = new MutationObserver(records => {
        for (const record of records) for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(revealTargets)) prepare(node);
          node.querySelectorAll<HTMLElement>(revealTargets).forEach(prepare);
        }
        // Release detached cards when filters or navigation replace the content.
        for (const el of prepared) if (!el.isConnected) {
          observer?.unobserve(el);
          prepared.delete(el);
        }
      });
      mutations.observe(root!, {childList:true, subtree:true});
    }

    configure();
    preference.addEventListener('change', configure);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('animationend', onAnimationEnd);
    root.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      reset();
      preference.removeEventListener('change', configure);
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('animationend', onAnimationEnd);
      root.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [page]);
}
