import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        this.initScrollCharacter();
    }

    /**
     * used in views/components/home/featured-products-style*.twig
     */
    initFeaturedTabs() {
        app.all('.tab-trigger', el => {
            el.addEventListener('click', ({ currentTarget: btn }) => {
                let id = btn.dataset.componentId;
                // btn.setAttribute('fill', 'solid');
                app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'is-active opacity-0 translate-y-3', 'inactive', tab => tab.id == btn.dataset.target)
                    .toggleClassIf(`#${id} .tab-trigger`, 'is-active', 'inactive', tabBtn => tabBtn == btn);

                // fadeIn active tabe
                setTimeout(() => app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'opacity-100 translate-y-0', 'opacity-0 translate-y-3', tab => tab.id == btn.dataset.target), 100);
            })
        });
        document.querySelectorAll('.s-block-tabs').forEach(block => block.classList.add('tabs-initialized'));
    }

    initScrollCharacter() {
        const character = document.getElementById('scroll-character');
        const footstepsLayer = document.getElementById('scroll-footprints');
        if (!character) return;

        const stopTargets = Array.from(document.querySelectorAll('[data-scroll-stop="true"]'));
        const isCtaTarget = (el) => {
            if (!el) return false;
            const text = (el.textContent || '').toLowerCase();
            return /شراء|اشتر|اشتراك|اشترك|اطلب|احجز|ابدأ|buy|order|subscribe|join|start/.test(text);
        };
        const ctaTargets = stopTargets.filter(isCtaTarget);

        let currentY = 0;
        const baseOffset = 160;
        let lastStepY = 0;
        let lastStepX = 0;
        let randomTarget = { x: 0, y: baseOffset };
        let nextWanderAt = 0;

        stopTargets.forEach(btn => {
            btn.addEventListener('mouseenter', () => character.classList.add('is-happy'));
            btn.addEventListener('mouseleave', () => character.classList.remove('is-happy'));
        });

        const update = () => {
            const viewportHeight = window.innerHeight || 800;
            const maxScroll = document.documentElement.scrollHeight - viewportHeight;
            const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
            const startY = baseOffset;
            const endY = Math.max(document.documentElement.scrollHeight - 260, startY + 240);
            let targetY = startY + progress * (endY - startY);
            const containerWidth = Math.max(document.documentElement.clientWidth, 1024);
            const minX = 24;
            const maxX = Math.max(minX + 120, containerWidth - 120);
            const now = performance.now();

            const activeCta = ctaTargets.find(btn => {
                const rect = btn.getBoundingClientRect();
                return rect.top > 80 && rect.top < viewportHeight - 160;
            });

            const activeTarget = activeCta || stopTargets.find(btn => {
                const rect = btn.getBoundingClientRect();
                return rect.top > 80 && rect.top < viewportHeight - 160;
            });

            let targetX = minX + (maxX - minX) * 0.5;

            if (activeTarget && activeTarget === activeCta) {
                const rect = activeTarget.getBoundingClientRect();
                targetY = Math.min(Math.max(window.scrollY + rect.top + rect.height * 0.5 - 60, startY), endY);
                const preferLeft = rect.left > containerWidth * 0.35;
                const besideX = preferLeft ? rect.left - 90 : rect.right + 20;
                targetX = Math.min(Math.max(besideX, minX), maxX);
                const closeEnough = Math.abs(currentY - targetY) < 18 && Math.abs(lastStepX - targetX) < 18;
                if (closeEnough) {
                    character.classList.add('is-pointing');
                    character.classList.add('is-looking');
                } else {
                    character.classList.remove('is-pointing');
                    character.classList.remove('is-looking');
                }
            } else {
                character.classList.remove('is-looking');
                character.classList.remove('is-pointing');
                if (now > nextWanderAt) {
                    const wanderY = startY + Math.random() * (endY - startY);
                    const wanderX = minX + Math.random() * (maxX - minX);
                    randomTarget = { x: wanderX, y: wanderY };
                    nextWanderAt = now + 1800 + Math.random() * 1600;
                }
                const wobbleX = Math.sin(now / 350) * 6;
                const wobbleY = Math.cos(now / 420) * 5;
                targetX = randomTarget.x + wobbleX;
                targetY = randomTarget.y + wobbleY;
            }

            currentY += (targetY - currentY) * 0.08;
            const currentX = lastStepX + (targetX - lastStepX) * 0.08;
            lastStepX = currentX;
            character.style.transform = `translate(${currentX}px, ${currentY}px)`;

            if (footstepsLayer && Math.abs(currentY - lastStepY) > 60) {
                const step = document.createElement('span');
                step.className = 'footstep';
                step.style.left = `${currentX + 24}px`;
                step.style.top = `${currentY + 70}px`;
                step.style.transform = `rotate(${Math.random() * 16 - 8}deg)`;
                footstepsLayer.appendChild(step);
                setTimeout(() => step.remove(), 4000);
                lastStepY = currentY;
            }
            requestAnimationFrame(update);
        };

        update();
    }
}

Home.initiateWhenReady(['index']);