(() => {
  const form = document.getElementById('bookingForm');
  const bookingsList = document.getElementById('bookingsList');
  const bookingsEmpty = document.getElementById('bookingsEmpty');
  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const STORAGE_KEY = 'demo_bookings_v1';

  const catalog = {
    hourly: {
      label: 'Hourly Tuition',
      courses: []
    },
    productivity: {
      label: 'Productivity',
      courses: [
        { id: 'photo-editing', label: 'Photo Editing' },
        { id: 'video-editing', label: 'Video Editing' },
        { id: 'notion', label: 'Notion' },
        { id: 'planning', label: 'Planning' },
        { id: 'animation', label: 'Animation' }
      ]
    },
    programming: {
      label: 'Programming',
      courses: [
        { id: 'html', label: 'HTML' },
        { id: 'css', label: 'CSS' },
        { id: 'js', label: 'JavaScript' },
        { id: 'sql', label: 'SQL' },
        { id: 'c', label: 'C' },
        { id: 'cpp', label: 'C++' },
        { id: 'python', label: 'Python' },
        { id: 'java', label: 'Java' },
        { id: 'r', label: 'R' }
      ]
    },
    webdev: {
      label: 'Web Development',
      courses: [
        { id: 'frontend', label: 'Front End' },
        { id: 'backend', label: 'Back End' }
      ]
    },
    financial: {
      label: 'Financial',
      courses: [
        { id: 'digital-marketing', label: 'Digital Marketing' }
      ]
    },
    uiux: {
      label: 'UI and UX Designing',
      courses: [
        { id: 'figma', label: 'Figma' }
      ]
    },
    security: {
      label: 'Security',
      courses: [
        { id: 'cyber-security', label: 'Cyber Security' },
        { id: 'ethical-hacking', label: 'Ethical Hacking' }
      ]
    }
  };

  function loadBookings() {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }

  function setMinDate() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  function validate(formData) {
    const errors = {};
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();
    const category = formData.get('category');
    const course = formData.get('course');
    const date = formData.get('date');
    const time = formData.get('time');
    const dob = formData.get('dob');
    const address = formData.get('address')?.trim();
    const grade = formData.get('grade')?.trim();
    const graduationType = formData.get('graduationType')?.trim();
    const subject = formData.get('subject')?.trim();
    const hours = formData.get('hours')?.trim();
    const referral = formData.get('referral')?.trim();
    const level = formData.get('level')?.trim();

    if (!name) errors.name = 'Please enter your full name.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      errors.phone = 'Enter a valid phone number.';
    }
    if (!category) errors.category = 'Select a category.';
    if (category === 'hourly') {
      if (!grade) errors.grade = 'Select a grade.';
      if (!graduationType) errors.graduationType = 'Select graduation type.';
      if (!subject) errors.subject = 'Enter a subject.';
      if (!hours || isNaN(Number(hours)) || Number(hours) < 1) {
        errors.hours = 'Enter valid hours (min 1).';
      }
    } else {
      if (!course) errors.course = 'Select a course.';
      if (!date) errors.date = 'Choose a date.';
      if (!time) errors.time = 'Choose a time.';
    }

    return errors;
  }

  function showErrors(errors) {
    const fields = ['name','email','phone','category','course','date','time','dob','address','grade','graduationType','subject','hours','referral','level'];
    for (const key of fields) {
      const el = document.querySelector(`[data-error-for="${key}"]`);
      if (el) el.textContent = errors[key] || '';
    }
  }

  function clearErrors() { showErrors({}); }

  function renderBookings() {
    const bookings = loadBookings();
    bookingsList.innerHTML = '';
    if (!bookings.length) {
      bookingsEmpty.style.display = 'block';
      return;
    }
    bookingsEmpty.style.display = 'none';
    for (const b of bookings) {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `
        <div class="item-top">
          <strong>${escapeHtml(b.name)}</strong>
          <span class="chip">${escapeHtml(mapCategory(b.category))}</span>
          <span class="chip">${escapeHtml(mapCourse(b.category, b.course))}</span>
        </div>
        <div>
          <span>${escapeHtml(b.email)}</span> · <span>${escapeHtml(b.phone)}</span>
        </div>
        <div>
          <span>${formatDateTime(b.date, b.time)}</span>
        </div>
        ${b.notes ? `<div class="notes">${escapeHtml(b.notes)}</div>` : ''}
        <div class="item-actions">
          <button class="btn danger" data-action="delete" data-id="${b.id}">Delete</button>
          <button class="btn success" data-action="confirm" data-id="${b.id}">Mark Confirmed</button>
        </div>
      `;
      bookingsList.appendChild(li);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function mapCategory(categoryId) {
    return catalog[categoryId]?.label || categoryId || '';
  }

  function mapCourse(categoryId, courseId) {
    const cat = catalog[categoryId];
    if (!cat) return courseId || '';
    const c = cat.courses.find(c => c.id === courseId);
    return c ? c.label : (courseId || '');
  }

  function formatDateTime(date, time) {
    try {
      const d = new Date(`${date}T${time}`);
      return d.toLocaleString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return `${date} ${time}`;
    }
  }

  function onListClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const id = button.getAttribute('data-id');
    const action = button.getAttribute('data-action');
    const bookings = loadBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return;

    if (action === 'delete') {
      bookings.splice(idx, 1);
      saveBookings(bookings);
      renderBookings();
      return;
    }
    if (action === 'confirm') {
      bookings[idx].confirmed = true;
      saveBookings(bookings);
      renderBookings();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearErrors();
    const formData = new FormData(form);
    const errors = validate(formData);
    if (Object.keys(errors).length) {
      showErrors(errors);
      return;
    }

    const booking = {
      id: crypto.randomUUID(),
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      category: formData.get('category'),
      course: formData.get('course'),
      date: formData.get('date'),
      time: formData.get('time'),
      dob: formData.get('dob') || '',
      address: (formData.get('address') || '').toString().trim(),
      notes: (formData.get('notes') || '').toString().trim(),
      grade: formData.get('grade') || '',
      graduationType: formData.get('graduationType') || '',
      subject: formData.get('subject') || '',
      hours: formData.get('hours') || '',
      referral: (formData.get('referral') || '').toString(),
      level: (formData.get('level') || '').toString(),
      createdAt: Date.now(),
      confirmed: false
    };

    const bookings = loadBookings();
    bookings.unshift(booking);
    saveBookings(bookings);
    if (booking.category === 'hourly') {
      const gradeLabel = document.querySelector('#grade option:checked')?.textContent || '';
      const text = [
        '*Hourly Tuition Request*',
        `Name: ${booking.name}`,
        `Phone: ${booking.phone}`,
        `Email: ${booking.email}`,
        booking.dob ? `DOB: ${booking.dob}` : undefined,
        booking.address ? `Address: ${booking.address}` : undefined,
        `Grade: ${gradeLabel}`,
        `Graduation Type: ${booking.graduationType}`,
        `Subject: ${booking.subject}`,
        `Hours: ${booking.hours}`,
        booking.level ? `Desired Level: ${booking.level}` : undefined,
        booking.referral ? `Heard About Us: ${booking.referral}` : undefined,
        booking.notes ? `Notes: ${booking.notes}` : undefined,
        '(If you attached files, please upload them here in WhatsApp.)'
      ].filter(Boolean).join('\n');
      const number = '7899097398';
      const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } else {
      const text = [
        '*Demo Class Booking*',
        `Name: ${booking.name}`,
        `Phone: ${booking.phone}`,
        `Email: ${booking.email}`,
        booking.dob ? `DOB: ${booking.dob}` : undefined,
        booking.address ? `Address: ${booking.address}` : undefined,
        `Category: ${mapCategory(booking.category)}`,
        `Course: ${mapCourse(booking.category, booking.course)}`,
        `Preferred: ${formatDateTime(booking.date, booking.time)}`,
        booking.level ? `Desired Level: ${booking.level}` : undefined,
        booking.referral ? `Heard About Us: ${booking.referral}` : undefined,
        booking.notes ? `Notes: ${booking.notes}` : undefined
      ].filter(Boolean).join('\n');
      const number = '7899097398';
      const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }

    form.reset();
    setMinDate();
    populateCoursesFor('');
    const hourlyFields = document.getElementById('hourlyFields');
    if (hourlyFields) hourlyFields.style.display = 'none';
    const courseSelect = document.getElementById('course');
    if (courseSelect) courseSelect.required = true;
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    if (dateInput) dateInput.required = true;
    if (timeInput) timeInput.required = true;
    renderBookings();
  }

  function populateCategories() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;
    categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
    for (const [id, cat] of Object.entries(catalog)) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = cat.label;
      categorySelect.appendChild(opt);
    }
  }

  function populateCoursesFor(categoryId) {
    const courseSelect = document.getElementById('course');
    if (!courseSelect) return;
    courseSelect.innerHTML = '<option value="" disabled selected>Select a course</option>';
    if (!categoryId || !catalog[categoryId] || categoryId === 'hourly') {
      courseSelect.disabled = true;
      return;
    }
    for (const c of catalog[categoryId].courses) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.label;
      courseSelect.appendChild(opt);
    }
    courseSelect.disabled = false;
  }

  function init() {
    setMinDate();
    populateCategories();
    populateCoursesFor('');
    const categorySelect = document.getElementById('category');
    categorySelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      populateCoursesFor(selected);
      const hourlyFields = document.getElementById('hourlyFields');
      const courseSelect = document.getElementById('course');
      const dateInput = document.getElementById('date');
      const timeInput = document.getElementById('time');
      const hourly = selected === 'hourly';
      if (hourlyFields) hourlyFields.style.display = hourly ? 'block' : 'none';
      if (courseSelect) courseSelect.required = !hourly;
      if (dateInput) dateInput.required = !hourly;
      if (timeInput) timeInput.required = !hourly;
    });
    renderBookings();
    form.addEventListener('submit', handleSubmit);
    bookingsList.addEventListener('click', onListClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


