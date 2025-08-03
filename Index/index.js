// Main JavaScript for Room3D Website
class Room3DWebsite {
  constructor() {
    this.init();
  }

  init() {
    // Trigger page load animations
    this.triggerPageLoadAnimations();

    this.setupAnimations();
    this.setupFormHandling();
    this.setupPricingSelection();
    this.setupMobileMenu();
    this.setupAuthModal();
    this.setupScrollEffects();
    this.setupCounters();
    this.setupScrollReveal();
  }

  triggerPageLoadAnimations() {
    // Add loaded class to body after a short delay to trigger animations
    setTimeout(() => {
      document.body.classList.add("loaded");
    }, 100);
  }

  setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
      ".pricing-card, .section-header"
    );
    animateElements.forEach((el) => {
      observer.observe(el);
    });

    // Add CSS for animations
    const style = document.createElement("style");
    style.textContent = `
            .pricing-card, .section-header {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }
            
            .animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .btn-primary, .btn-secondary {
                transition: all 0.3s ease;
            }
            
            .btn-primary:hover, .btn-secondary:hover {
                transform: translateY(-2px);
            }
        `;
    document.head.appendChild(style);
  }

  setupFormHandling() {
    // Đã loại bỏ contact-form vì không còn sử dụng
    // Add form validation
    const inputs = document.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        this.validateField(input);
      });
    });
  }

  handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Đang gửi...";
    submitBtn.disabled = true;

    // Simulate form submission
    setTimeout(() => {
      // Show success message
      this.showNotification("Tin nhắn đã được gửi thành công!", "success");

      // Reset form
      form.reset();

      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = "";

    switch (field.type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
        message = "Email không hợp lệ";
        break;
      case "text":
        isValid = value.length >= 2;
        message = "Tên phải có ít nhất 2 ký tự";
        break;
      default:
        isValid = value.length > 0;
        message = "Trường này là bắt buộc";
    }

    this.showFieldValidation(field, isValid, message);
  }

  showFieldValidation(field, isValid, message) {
    // Remove existing validation classes
    field.classList.remove("valid", "invalid");

    // Remove existing error message
    const existingError = field.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    if (!isValid && field.value.trim() !== "") {
      field.classList.add("invalid");
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = message;
      errorDiv.style.color = "#e74c3c";
      errorDiv.style.fontSize = "0.8rem";
      errorDiv.style.marginTop = "5px";
      field.parentNode.appendChild(errorDiv);
    } else if (isValid && field.value.trim() !== "") {
      field.classList.add("valid");
    }
  }

  setupMobileMenu() {
    // Create mobile menu button
    const header = document.querySelector(".header");
    const mobileMenuBtn = document.createElement("button");
    mobileMenuBtn.className = "mobile-menu-btn";
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.style.display = "none";

    header.appendChild(mobileMenuBtn);

    // Mobile menu functionality
    mobileMenuBtn.addEventListener("click", () => {
      const menu = document.querySelector(".menu");
      menu.classList.toggle("mobile-open");
      mobileMenuBtn.innerHTML = menu.classList.contains("mobile-open")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        document.querySelector(".menu").classList.remove("mobile-open");
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });

    // Show/hide mobile menu button
    const updateMobileMenu = () => {
      mobileMenuBtn.style.display = window.innerWidth <= 768 ? "block" : "none";
    };

    updateMobileMenu();
    window.addEventListener("resize", updateMobileMenu);

    // Add mobile menu styles
    const mobileStyles = document.createElement("style");
    mobileStyles.textContent = `
            @media (max-width: 768px) {
                .mobile-menu-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #4a6bff;
                    cursor: pointer;
                    padding: 10px;
                }
                
                .menu {
                    position: fixed;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    flex-direction: column;
                    padding: 20px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    transform: translateY(-100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                
                .menu.mobile-open {
                    transform: translateY(0);
                    opacity: 1;
                }
                
                .menu a {
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                }
                
                .menu a:last-child {
                    border-bottom: none;
                }
            }
        `;
    document.head.appendChild(mobileStyles);
  }

  setupAuthModal() {
    const modalOverlay = document.querySelector(".auth-modal-overlay");
    if (!modalOverlay) return;

    const loginTrigger = document.querySelector("#login-trigger");
    const registerTrigger = document.querySelector("#register-trigger");
    const closeModalBtn = document.querySelector(".close-modal-btn");
    const tabs = document.querySelectorAll(".tab-btn");
    const forms = document.querySelectorAll(".auth-form");

    const openModal = (formType) => {
      modalOverlay.classList.add("active");
      document.body.classList.add("modal-open");
      switchForm(formType);
    };

    const closeModal = () => {
      modalOverlay.classList.remove("active");
      document.body.classList.remove("modal-open");
    };

    const imagePanel = document.querySelector(".modal-image-panel");
    const switchForm = (formType) => {
      // Deactivate all
      tabs.forEach((tab) => tab.classList.remove("active"));
      forms.forEach((form) => form.classList.remove("active"));

      // Activate target
      document
        .querySelector(`.tab-btn[data-form="${formType}"]`)
        .classList.add("active");
      document
        .querySelector(`.auth-form.${formType}-form`)
        .classList.add("active");

      // Đổi class ảnh panel
      if (imagePanel) {
        imagePanel.classList.remove("login-image", "register-image");
        imagePanel.classList.add(formType + "-image");
      }
    };

    loginTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("login");
    });

    registerTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("register");
    });

    closeModalBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => switchForm(tab.dataset.form));
    });
  }

  setupScrollEffects() {
    // Parallax effect for hero section (mượt mà hơn)
    let lastScrollY = window.pageYOffset;
    let ticking = false;
    function parallaxHero() {
      const scrolled = lastScrollY;
      const heroVisual = document.querySelector(".hero-visual");
      const heroLayers = document.querySelectorAll(".hero-layer");
      if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrolled * -0.2}px)`;
        heroLayers.forEach((layer) => {
          const speed = layer.classList.contains("layer-1") ? -0.3 : -0.15;
          layer.style.transform = `translateY(${scrolled * speed}px) rotate(${layer.classList.contains("layer-1") ? -15 : 15
            }deg)`;
        });
      }
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      lastScrollY = window.pageYOffset;
      if (!ticking) {
        window.requestAnimationFrame(parallaxHero);
        ticking = true;
      }
    });
    parallaxHero();
    // Progress bar
    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #4a6bff, #6c5ce7);
            z-index: 1001;
            transition: width 0.1s ease;
        `;
    document.body.appendChild(progressBar);
    window.addEventListener("scroll", () => {
      const scrolled =
        (window.pageYOffset /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      progressBar.style.width = scrolled + "%";
    });
  }

  setupCounters() {
    // Animate statistics numbers
    const stats = document.querySelectorAll(".stat-number");

    const animateCounter = (element, target) => {
      let current = 0;
      const increment = target / 100;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (target >= 1000 ? "+" : "");
      }, 20);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(
              entry.target.textContent.replace(/[^0-9]/g, "")
            );
            animateCounter(entry.target, target);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach((stat) => statsObserver.observe(stat));
  }

  setupScrollReveal() {
    // Tự động áp dụng cho mọi phần tử có class fade-in-up, fade-in-left, fade-in-right
    document
      .querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right")
      .forEach((el) => {
        el.classList.add("fade-in-init");
      });
    // Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document
      .querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right")
      .forEach((el) => {
        observer.observe(el);
      });
  }

  setupPricingSelection() {
    const pricingCards = document.querySelectorAll(".pricing-card");

    pricingCards.forEach((card) => {
      card.addEventListener("click", () => {
        // Remove 'selected' class from all cards
        pricingCards.forEach((c) => c.classList.remove("selected"));
        // Add 'selected' class to the clicked card
        card.classList.add("selected");
      });
    });

    // Optionally, select the 'Pro' package by default
    const proCard = document.querySelector(".pricing-card:nth-child(2)");
    if (proCard) {
      proCard.classList.add("selected");
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === "success"
        ? "background: #27ae60;"
        : "background: #3498db;"
      }
        `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize website when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Room3DWebsite();

  // Add some interactive features
  const ctaButtons = document.querySelectorAll(".btn-primary");
  ctaButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Add ripple effect
      const ripple = document.createElement("span");
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add ripple animation
  const rippleStyle = document.createElement("style");
  rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
  document.head.appendChild(rippleStyle);

  // Add loading class trigger
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", function (e) {
      let valid = true;
      const inputs = form.querySelectorAll("input, textarea");
      inputs.forEach((input) => {
        // Gọi lại hàm validateField nếu có
        if (typeof window.Room3DWebsite === "function") {
          const website = new Room3DWebsite();
          website.validateField(input);
        }
        // Kiểm tra thủ công nếu không có hàm
        if (!input.value.trim()) {
          valid = false;
          input.classList.add("invalid");
          let error = input.parentNode.querySelector(".error-message");
          if (!error) {
            error = document.createElement("div");
            error.className = "error-message";
            input.parentNode.appendChild(error);
          }
          error.textContent = "Vui lòng điền vào trường này.";
        }
      });
      if (!valid) e.preventDefault();
    });
  });

  const menuLinks = document.querySelectorAll(".menu a");
  const sections = Array.from(menuLinks).map((link) =>
    document.querySelector(link.getAttribute("href"))
  );
  function onScroll() {
    let scrollPos = window.scrollY || window.pageYOffset;
    let offset = 120; // Điều chỉnh nếu header cố định
    sections.forEach((section, idx) => {
      if (section) {
        const top = section.offsetTop - offset;
        const bottom = top + section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          menuLinks.forEach((link) => link.classList.remove("active"));
          menuLinks[idx].classList.add("active");
        }
      }
    });
  }
  window.addEventListener("scroll", onScroll);
  menuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Cuộn mượt tới section
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 100, // Điều chỉnh nếu header cố định
          behavior: "smooth",
        });
      }
    });
  });
  onScroll();

  if (document.querySelector(".gallery-swiper")) {
    new Swiper(".gallery-swiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      loop: true,
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 200,
        modifier: 1,
        slideShadows: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        0: { slidesPerView: 1.2 },
        600: { slidesPerView: 2.2 },
        900: { slidesPerView: 3.2 },
      },
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Xử lý modal đăng nhập/đăng ký
  const loginTrigger = document.getElementById("login-trigger");
  const modalOverlay = document.querySelector(".auth-modal-overlay");
  const closeModalBtn = document.querySelector(".close-modal-btn");

  function closeModal() {
    modalOverlay.style.display = "none";
    document.body.style.overflow = "";
  }
  function openModal() {
    modalOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  if (loginTrigger && modalOverlay && closeModalBtn) {
    loginTrigger.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
    closeModalBtn.addEventListener("click", closeModal);
    // Đóng modal khi click ra ngoài
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // Xử lý đăng nhập
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      // if (!email || !password) {
      //     alert('Vui lòng nhập đầy đủ email và mật khẩu!');
      //     return;
      // }

      try {
        const response = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert("Đăng nhập thành công! Xin chào " + data.name);
          closeModal();

          // Ẩn nút đăng nhập, hiện user info
          document.getElementById("login-trigger").style.display = "none";
          document.getElementById("user-info").style.display = "inline-flex";
          document.getElementById("user-name").textContent = data.name;

          // Xử lý đăng xuất
          document.getElementById("logout-btn").onclick = function (e) {
            e.preventDefault();
            document.getElementById("user-info").style.display = "none";
            document.getElementById("login-trigger").style.display =
              "inline-block";
            alert("Bạn đã đăng xuất!");
          };
          return;
        } else {
          alert(data.message || "Đăng nhập thất bại!");
        }
      } catch (err) {
        alert("Không thể kết nối tới server!");
      }
    });
  }
});

window.addEventListener("scroll", () => {
  const blobs = document.querySelectorAll(".absolute > div");
  blobs.forEach((blob, index) => {
    // Tính toán translateX theo hàm sin để tạo chuyển động qua trái/phải
    const amplitude = 210; // Biên độ (khoảng cách tối đa qua trái/phải, tính bằng px)
    const frequency = 0.003; // Tần số dao động (điều chỉnh tốc độ qua lại)
    const translateX =
      Math.sin(window.scrollY * frequency * (index + 1)) * amplitude;

    // Tính toán translateY (giữ tuyến tính như trước)
    const translateY = window.scrollY * (0.1 * (index + 1));

    // Áp dụng transform
    blob.style.transform = `translate(${translateX}px, ${translateY}px)`;
  });
});
