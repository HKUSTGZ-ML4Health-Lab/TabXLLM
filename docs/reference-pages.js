'use strict';
const copy = document.querySelector('#copy');
if (copy) {
  const copyLabel = copy.querySelector('.copy-label') || copy;
  const defaultCopyLabel = copyLabel.textContent;
  copy.addEventListener('click', async () => {
    const bib = document.querySelector('#bib');
    try {
      await navigator.clipboard.writeText(bib.textContent);
      copyLabel.textContent = 'Copied!';
      document.querySelector('#copy-status').textContent = 'BibTeX copied to clipboard.';
      setTimeout(() => { copyLabel.textContent = defaultCopyLabel; }, 2000);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(bib);
      selection.removeAllRanges();
      selection.addRange(range);
      copyLabel.textContent = 'Text selected';
      document.querySelector('#copy-status').textContent = 'Citation selected. Use your browser’s copy command.';
    }
  });
}
document.querySelectorAll('.sort-button').forEach(button => {
  button.addEventListener('click', () => {
    const table = button.closest('table');
    const tbody = table.tBodies[0];
    const column = Number(button.dataset.column);
    const direction = button.dataset.direction;
    const rows = Array.from(tbody.rows);
    rows.sort((a, b) => {
      if (column === 0) {
        const order = (a.cells[0].dataset.sort || a.cells[0].textContent).localeCompare(b.cells[0].dataset.sort || b.cells[0].textContent);
        return direction === 'asc' ? order : -order;
      }
      const av = a.cells[column].dataset.value;
      const bv = b.cells[column].dataset.value;
      // Unreported settings always stay at the end, in either sort direction.
      if (av === '' || bv === '') return av === bv ? 0 : av === '' ? 1 : -1;
      return direction === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    rows.forEach(row => tbody.append(row));
    table.querySelectorAll('thead th').forEach(th => th.removeAttribute('aria-sort'));
    button.closest('th').setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
    button.dataset.direction = direction === 'asc' ? 'desc' : 'asc';
  });
});

document.querySelectorAll('.results-explorer').forEach(explorer => {
  const tabs = Array.from(explorer.querySelectorAll('[role="tab"]'));
  const activate = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activate(tabs[next]);
      tabs[next].focus();
    });
  });
  if (tabs.length) {
    activate(tabs[0]);
    explorer.classList.add('is-enhanced');
  }
});
