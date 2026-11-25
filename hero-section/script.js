const portrait = document.querySelector("[data-portrait]");
const hint = document.querySelector(".hero__hint");

if (portrait && window.gsap) {
  const motion = gsap.matchMedia();

  motion.add("(any-hover: hover) and (prefers-reduced-motion: no-preference)", () => {
    const eyes = [
      { selector: ".eye--screen-left .iris", rangeX: 1.3, rangeY: 0.28, slope: -0.24 },
      { selector: ".eye--screen-right .iris", rangeX: 1.6, rangeY: 0.34, slope: -0.13 }
    ].map((eye) => {
      const iris = portrait.querySelector(eye.selector);
      const style = getComputedStyle(iris);
      const x = Number(style.getPropertyValue("--rest-x"));
      const y = Number(style.getPropertyValue("--rest-y"));
      const easing = { duration: 0.42, ease: "power3.out" };
      gsap.set(iris, { x: 0, y: 0, xPercent: x, yPercent: y });

      return {
        ...eye,
        x,
        y,
        moveX: gsap.quickTo(iris, "xPercent", easing),
        moveY: gsap.quickTo(iris, "yPercent", easing)
      };
    });

    function follow(event) {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;

      const bounds = portrait.getBoundingClientRect();
      // Usa um ponto de referência comum para os dois olhos.
      const dx = (event.clientX - bounds.left - bounds.width * 0.405) / (bounds.width * 0.3);
      const dy = (event.clientY - bounds.top - bounds.height * 0.448) / (bounds.height * 0.3);
      const distance = Math.max(1, Math.hypot(dx, dy));
      const horizontal = dx / distance;
      const vertical = dy / distance;

      for (const eye of eyes) {
        const x = horizontal * eye.rangeX;
        eye.moveX(eye.x + x);
        eye.moveY(eye.y + vertical * eye.rangeY + x * eye.slope);
      }
    }

    function reset() {
      for (const eye of eyes) {
        eye.moveX(eye.x);
        eye.moveY(eye.y);
      }
    }

    hint.hidden = false;
    window.addEventListener("pointermove", follow, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);

    return () => {
      hint.hidden = true;
      window.removeEventListener("pointermove", follow);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  });
}
