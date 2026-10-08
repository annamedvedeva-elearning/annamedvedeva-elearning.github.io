'use strict';
const answers = document.querySelectorAll('[data-answer]');
answers.forEach(button => {
  button.addEventListener('click', () => {
    answers.forEach(answer => answer.setAttribute('aria-pressed', String(answer === button)));
    document.getElementById('feedback').textContent = button.dataset.answer === 'yes'
      ? 'Да! Сначала понимаем, кого обучаем и\u00a0какую задачу решаем.'
      : 'Это может быть полезно, но\u00a0сначала определим задачу и\u00a0аудиторию. Попробуйте ещё раз.';
  });
});

// Measure collapsed content only. Opening a case must never resize its neighbours.
const projectGrid = document.querySelector('.projects');
const projectCards = [...projectGrid.querySelectorAll('.project')];
const lesson = projectGrid.querySelector('.lesson');
function equalizeCards() {
  projectGrid.classList.add('measuring');
  const baseHeight = Math.ceil(Math.max(...projectCards.map(card => card.offsetHeight), lesson.offsetHeight));
  projectGrid.style.setProperty('--project-base-height', `${baseHeight}px`);
  projectGrid.classList.remove('measuring');
}
let previousWidth = 0;
new ResizeObserver(entries => {
  const width = entries[0].contentRect.width;
  if (Math.abs(width - previousWidth) > 0.5) {
    previousWidth = width;
    equalizeCards();
  }
}).observe(projectGrid);
document.fonts.ready.then(equalizeCards);
window.addEventListener('load', equalizeCards);

// Native modal dialogs keep focus inside and make the background inert.
document.querySelectorAll('[data-project-dialog]').forEach(button => {
  const dialog = document.getElementById(button.dataset.projectDialog);
  button.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      button.click();
    }
  });
  button.addEventListener('click', () => {
    dialog.showModal();
    dialog.querySelector('.dialog-content').scrollTop = 0;
    document.documentElement.classList.add('modal-open');
  });
  const closeDialog = async () => {
    if (!dialog.open || dialog.classList.contains('closing')) return;
    dialog.classList.add('closing');
    await Promise.allSettled(dialog.getAnimations().map(animation => animation.finished));
    dialog.close();
    dialog.classList.remove('closing');
  };
  dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialog();
  });
  let pressedOutside = false;
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { pressedOutside = outside(event); });
  dialog.addEventListener('click', event => {
    if (pressedOutside && outside(event)) closeDialog();
    pressedOutside = false;
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('modal-open');
    button.focus({ preventScroll: true });
  });
});
