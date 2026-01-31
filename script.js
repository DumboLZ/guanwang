document.addEventListener('DOMContentLoaded', () => {
    // 弹窗逻辑
    // 预约表单提交逻辑
    const form = document.querySelector('.subscribe-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');
            const email = emailInput.value;

            // 简单的防抖/禁用
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';

            try {
                const response = await fetch('http://localhost:3000/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.success) {
                    alert('预约成功！感谢您的关注。');
                    emailInput.value = '';
                    closeModal();
                } else {
                    alert('预约失败：' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('网络错误，请稍后重试，或确保后台服务已启动。');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '立即预约';
            }
        });
    }

    // 弹窗逻辑
    const modal = document.getElementById('subscribe-modal');
    const navBtn = document.getElementById('nav-subscribe-btn');
    const heroBtn = document.getElementById('hero-subscribe-btn');
    const mobileBtn = document.querySelector('.mobile-subscribe-btn');
    const closeBtn = document.querySelector('.close-modal');

    // 打开弹窗
    function openModal() {
        modal.style.display = 'flex';
        // 如果移动端菜单是打开的，需要关闭
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    }

    // 关闭弹窗
    function closeModal() {
        modal.style.display = 'none';
    }

    if (navBtn) navBtn.addEventListener('click', openModal);
    if (heroBtn) heroBtn.addEventListener('click', openModal);
    if (mobileBtn) mobileBtn.addEventListener('click', openModal);

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // 点击外部关闭弹窗
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 移动端菜单逻辑
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMobileMenuBtn = document.querySelector('.close-mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // 禁止背景滚动
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', openMobileMenu);
    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);

    // 点击链接关闭菜单
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
});
