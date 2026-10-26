'use strict';

// All reading/navigation works in HTML; JavaScript only enhances local controls.
const radios = [...document.querySelectorAll('input[name="country"]')];
const panels = [...document.querySelectorAll('.country-panel')];
const photos = [...document.querySelectorAll('[data-country-image]')];
const selector = document.querySelector('.country-selector');
const countryStatus = document.querySelector('#country-status');
const mappingsValid = radios.length === 4 && radios.every(radio =>
  panels.some(panel => panel.id === radio.value) && photos.some(photo => photo.dataset.countryImage === radio.value));

function showCountry(id, announce = false) {
  const panel = panels.find(item => item.id === id);
  if (!panel) return;
  panels.forEach(item => { item.hidden = item !== panel; });
  photos.forEach(photo => { photo.hidden = photo.dataset.countryImage !== id; });
  radios.forEach(radio => { radio.checked = radio.value === id; });
  if (announce) countryStatus.textContent = `Εμφανίζονται οι υπηρεσίες για: ${panel.querySelector('h2').textContent}.`;
}

function revealFragment(moveFocus = false) {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const panel = panels.find(item => item.id === id);
  if (panel && mappingsValid) showCountry(id);
  const target = document.getElementById(id);
  const disclosure = target?.closest('details');
  if (disclosure) disclosure.open = true;
  if (target) requestAnimationFrame(() => {
    target.scrollIntoView({block: 'start', behavior: 'instant'});
    if (moveFocus && panel) panel.querySelector('h2').focus({preventScroll: true});
  });
}

if (mappingsValid) {
  radios.forEach(radio => radio.addEventListener('change', () => showCountry(radio.value, true)));
  document.querySelector('.country-media').classList.add('enhanced');
  document.querySelector('.country-panels').classList.add('enhanced');
  showCountry(panels.some(panel => panel.id === location.hash.slice(1)) ? location.hash.slice(1) : 'country-greece');
  document.querySelector('.country-fallback').hidden = true;
  selector.hidden = false;
}
window.addEventListener('hashchange', () => revealFragment(true));
revealFragment();

const mobileMenu = document.querySelector('.mobile-menu');
if (mobileMenu) {
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.open) {
      mobileMenu.open = false;
      mobileMenu.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (mobileMenu.open && !mobileMenu.contains(event.target)) mobileMenu.open = false;
  });
}

const form = document.querySelector('#demo-form');
if (form) {
  const fields = [
    {input: form.querySelector('#contact-name'), error: form.querySelector('#name-error'), empty: 'Συμπληρώστε ονοματεπώνυμο.'},
    {input: form.querySelector('#contact-email'), error: form.querySelector('#email-error'), empty: 'Συμπληρώστε email.'},
    {input: form.querySelector('#contact-message'), error: form.querySelector('#message-error'), empty: 'Συμπληρώστε μήνυμα.'}
  ];
  const result = form.querySelector('#form-status');
  const submit = form.querySelector('#demo-submit');
  if (fields.every(field => field.input && field.error) && result && submit) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      let firstInvalid = null;
      fields.forEach(({input, error, empty}) => {
        input.setCustomValidity('');
        const message = !input.value.trim() ? empty : input.type === 'email' && input.validity.typeMismatch ? 'Συμπληρώστε ένα έγκυρο email.' : '';
        error.textContent = message;
        input.setCustomValidity(message);
        if (message) {
          input.setAttribute('aria-invalid', 'true');
          firstInvalid ||= input;
        } else input.removeAttribute('aria-invalid');
      });
      if (firstInvalid) {
        result.textContent = 'Ελέγξτε τα πεδία που επισημαίνονται.';
        firstInvalid.focus();
        return;
      }
      // No request, email action, URL mutation, storage or logging of form values.
      result.textContent = 'Η δοκιμή ολοκληρώθηκε. Δεν στάλθηκε μήνυμα και δεν αποθηκεύτηκαν στοιχεία.';
    });
    fields.forEach(({input, error}) => input.addEventListener('input', () => {
      input.setCustomValidity('');
      input.removeAttribute('aria-invalid');
      error.textContent = '';
      result.textContent = '';
    }));
    form.noValidate = true;
    submit.disabled = false;
  }
}

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.classList.add('has-entered');
    });
  }, {threshold: .12});
  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  motionPreference.addEventListener('change', event => { if (event.matches) observer.disconnect(); });
}
