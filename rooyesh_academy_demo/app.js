(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const toast = $("#toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    const firstInput = $("input", modal);
    if (firstInput) setTimeout(() => firstInput.focus(), 60);
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("hidden");
    if (!$(".modal-backdrop:not(.hidden)")) {
      document.body.style.overflow = "";
    }
  }

  $("#loginOpen")?.addEventListener("click", () => openModal("loginModal"));
  $("#footerLogin")?.addEventListener("click", () => openModal("loginModal"));
  $("#bookingOpen")?.addEventListener("click", () => openModal("bookingModal"));

  $$("[data-close]").forEach(button => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });

  $$(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) closeModal(backdrop.id);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      $$(".modal-backdrop:not(.hidden)").forEach(modal => closeModal(modal.id));
    }
  });

  const nav = $(".desktop-nav");
  $("#menuToggle")?.addEventListener("click", () => {
    if (!nav) return;
    const isOpen = nav.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(isOpen));
  });

  $$(".desktop-nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav?.classList.remove("open");
      $("#menuToggle")?.setAttribute("aria-expanded", "false");
    });
  });

  function applyCourseFilter(filter) {
    const cards = $$(".course-card");
    let visible = 0;

    cards.forEach(card => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    $("#emptyState")?.classList.toggle("hidden", visible > 0);
  }

  $$(".filter-chip").forEach(button => {
    button.addEventListener("click", () => {
      $$(".filter-chip").forEach(chip => {
        chip.classList.toggle("selected", chip === button);
      });
      applyCourseFilter(button.dataset.filter);
    });
  });

  // از رویدادهای کلیک برای کارت‌های جدید هم پشتیبانی می‌کنیم.
  $("#courseGrid")?.addEventListener("click", event => {
    const button = event.target.closest(".course-detail");
    if (!button) return;
    showToast(`«${button.dataset.course}» انتخاب شد؛ صفحه خرید در نسخه بعدی اضافه می‌شود.`);
  });

  $("#loginForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const phone = $("#phone").value.replace(/[^\d]/g, "");

    if (!/^0?9\d{9}$/.test(phone)) {
      $("#loginFeedback").textContent = "شماره موبایل را به شکل درست وارد کن.";
      $("#loginFeedback").style.color = "#c0392b";
      return;
    }

    $("#otpPanel").classList.remove("hidden");
    $("#loginFeedback").textContent = "حالت نمایشی فعال شد؛ پیامکی ارسال نشده است.";
    $("#loginFeedback").style.color = "#228454";
    $("#otp").focus();
  });

  $("#verifyOtp")?.addEventListener("click", () => {
    const code = $("#otp").value.replace(/[^\d]/g, "");

    if (code === "1234") {
      $("#loginFeedback").textContent = "ورود نمایشی موفق بود! احراز هویت واقعی هنوز متصل نیست.";
      $("#loginFeedback").style.color = "#228454";
      showToast("ورود نمایشی موفق بود");
      setTimeout(() => closeModal("loginModal"), 1600);
    } else {
      $("#loginFeedback").textContent = "برای تست، کد ۱۲۳۴ را وارد کن.";
      $("#loginFeedback").style.color = "#c0392b";
    }
  });

  $("#bookingForm")?.addEventListener("submit", event => {
    event.preventDefault();
    $("#bookingFeedback").textContent = "درخواست نمایشی ثبت شد؛ هنوز به سامانه رزرو متصل نیست.";
    showToast("درخواست نمایشی ثبت شد");
    $("#bookingForm").reset();
  });

  $("#newsletterForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const email = $("#newsletterEmail").value.trim();
    if (!email) return;
    $("#newsletterFeedback").textContent = "ممنون! این فرم نمایشی است و اطلاعاتی ارسال یا ذخیره نشد.";
    $("#newsletterForm").reset();
  });

  async function loadCoursesFromAPI() {
    const courseGrid = $("#courseGrid");
    const emptyState = $("#emptyState");

    if (!courseGrid) return;

    courseGrid.innerHTML =
      '<p class="courses-loading">در حال دریافت دوره‌ها...</p>';

    try {
      const response = await fetch("/api/courses");

      if (!response.ok) {
        throw new Error(`خطای سرور: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.courses)) {
        throw new Error("ساختار اطلاعات دوره‌ها معتبر نیست.");
      }

      courseGrid.innerHTML = "";

      result.courses.forEach(course => {
        const card = document.createElement("article");
        card.className = "course-card";
        card.dataset.category = ["career", "personal", "digital"].includes(course.category) ? course.category : "digital";

        const cover = document.createElement("div");
        cover.className = "course-cover cover-lavender";

        const label = document.createElement("span");
        label.className = "cover-label";
        label.textContent = "دوره آموزشی";

        const number = document.createElement("span");
        number.className = "cover-number";
        number.textContent = String(course.id).padStart(2, "0");

        cover.append(label, number);

        const content = document.createElement("div");
        content.className = "course-content";

        const meta = document.createElement("div");
        meta.className = "course-meta";
        meta.textContent = "دوره آنلاین";

        const title = document.createElement("h3");
        title.textContent = course.title;

        const description = document.createElement("p");
        description.textContent = course.description || "برای شروع یادگیری و پیشرفت قدم بعدی را بردار.";

        const bottom = document.createElement("div");
        bottom.className = "course-bottom";

        const price = document.createElement("div");
        price.className = "price";

        const amount = document.createElement("strong");
        amount.textContent = Number(course.price).toLocaleString("fa-IR");

        const currency = document.createElement("small");
        currency.textContent = "تومان";

        price.append(amount, currency);

        const detailButton = document.createElement("button");
        detailButton.className = "icon-button course-detail";
        detailButton.type = "button";
        detailButton.textContent = "←";
        detailButton.setAttribute("aria-label", "جزئیات دوره");
        detailButton.dataset.course = course.title;

        bottom.append(price, detailButton);
        content.append(meta, title, description, bottom);
        card.append(cover, content);
        courseGrid.appendChild(card);
      });

      applyCourseFilter($(".filter-chip.selected")?.dataset.filter || "all");

      if (emptyState) {
        emptyState.classList.toggle("hidden", result.courses.length > 0);
      }
    } catch (error) {
      console.error("خطا در دریافت دوره‌ها:", error);
      courseGrid.textContent =
        "دریافت دوره‌ها ناموفق بود. اتصال سرور را بررسی و صفحه را تازه‌سازی کن.";
      if (emptyState) emptyState.classList.add("hidden");
    }
  }

  loadCoursesFromAPI();
})();
