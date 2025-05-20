document.addEventListener('DOMContentLoaded', () => {
  // Security: Disable developer tools
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      alert('Access to developer tools is restricted.');
    }
  });

  // Security: Disable right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert('Right-click is disabled for security reasons.');
  });

  // Security: Console warning and disable logging
  console.log('%cWARNING: Using the console may expose sensitive data. Proceed at your own risk.', 'color: red; font-size: 16px;');
  console.log = console.warn = console.error = () => {};

  // Security: Anti-debugging (basic)
  (function antiDebug() {
    const start = performance.now();
    debugger; // Pauses if dev tools are open
    if (performance.now() - start > 100) {
      alert('Debugging detected. This action is not allowed.');
      window.location.reload();
    }
    setTimeout(antiDebug, 1000);
  })();

  // Security: Disable text selection and copying
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.msUserSelect = 'none';
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    alert('Copying content is disabled.');
  });

  // Theme toggle functionality
  const body = document.body;
  const themeToggle = document.querySelector('.theme-toggle') || document.createElement('div');
  if (!themeToggle.parentElement) {
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-sun theme-icon"></i>';
    document.body.appendChild(themeToggle);
  }

  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);
  themeToggle.querySelector('.theme-icon').className = `fas fa-${savedTheme === 'light' ? 'moon' : 'sun'} theme-icon`;

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.querySelector('.theme-icon').className = `fas fa-${newTheme === 'light' ? 'moon' : 'sun'} theme-icon`;
  });

  // Simulate page loading
  const loadingBar = document.getElementById('loading-bar');
  if (loadingBar) {
    let width = 0;
    const loadingInterval = setInterval(() => {
      if (width >= 100) {
        clearInterval(loadingInterval);
        loadingBar.style.width = '100%';
        setTimeout(() => {
          loadingBar.style.opacity = '0';
        }, 300);
      } else {
        width += Math.random() * 10;
        loadingBar.style.width = `${Math.min(width, 100)}%`;
      }
    }, 100);
  }

  // Back to top button
  const backToTopButton = document.getElementById('back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Fetch and render TOC
  const tocList = document.querySelector('.toc-list');
  async function fetchAndRenderTOC() {
    try {
      // Security: Basic token check (placeholder; requires server-side validation)
      const token = localStorage.getItem('authToken') || 'placeholder-token';
      const response = await fetch('https://ancuong.com/an-cuong/toc.json', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Unauthorized access to TOC');
      const tocItems = await response.json();
      tocList.innerHTML = renderTocItems(tocItems, 1);
      attachTocEventListeners();
    } catch (err) {
      console.error('Error fetching TOC:', err);
      tocList.innerHTML = '<p>Error loading TOC. Please try again.</p>';
    }
  }

  function renderTocItems(items, level) {
    return items.map(item => `
      <li class="toc-item${item.isFolder ? ' folder-collapsed' : ''} level-${level}">
        <a href="${item.href || '#'}" class="toc-link${item.isFolder ? ' folder-toggle' : ''} level-${level}" ${item.isFolder ? 'aria-expanded="false"' : ''}>
          <span class="toc-icon">${item.icon}</span>
          <div class="toc-content">
            <span class="toc-title">${item.title}</span>
            ${item.description ? `<div class="toc-desc">${item.description}</div>` : ''}
          </div>
          ${item.isFolder ? '<span class="collapse-icon">+</span>' : ''}
        </a>
        ${item.children.length > 0 ? `
          <ul class="subfolder level-${level + 1}">
            ${renderTocItems(item.children, level + 1)}
          </ul>
        ` : ''}
      </li>
    `).join('');
  }

  function attachTocEventListeners() {
    // Event delegation for folder toggles
    tocList.addEventListener('click', (e) => {
      const toggle = e.target.closest('.folder-toggle');
      if (toggle) {
        e.preventDefault();
        const parentItem = toggle.parentElement;
        const subfolder = parentItem.querySelector('.subfolder');
        const collapseIcon = toggle.querySelector('.collapse-icon');
        const isExpanded = !parentItem.classList.contains('folder-collapsed');

        parentItem.classList.toggle('folder-collapsed');
        collapseIcon.textContent = isExpanded ? '+' : '−';
        toggle.setAttribute('aria-expanded', !isExpanded);

        if (subfolder) {
          subfolder.style.animation = isExpanded ? 'collapseOut 0.3s ease forwards' : 'expandIn 0.3s ease forwards';
          subfolder.style.display = isExpanded ? 'block' : 'block';
          if (isExpanded) {
            setTimeout(() => {
              if (parentItem.classList.contains('folder-collapsed')) {
                subfolder.style.display = 'none';
              }
            }, 300);
          }
        }
      }
    });

    // Ripple effect for links
    tocList.addEventListener('click', (e) => {
      const link = e.target.closest('.toc-link');
      if (link) {
        const ripple = document.createElement('div');
        const rect = link.getBoundingClientRect();
        ripple.className = 'ripple';
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        link.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      }
    });

    // Highlight active item
    tocList.addEventListener('click', (e) => {
      const link = e.target.closest('.toc-link:not(.folder-toggle)');
      if (link) {
        document.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });

    // Department badge click handling
    document.addEventListener('click', (e) => {
      const badge = e.target.closest('.department-badge');
      if (badge) {
        const departmentName = badge.textContent.trim();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.value = departmentName;
          searchInput.focus();
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          badge.style.transform = 'scale(1.1)';
          setTimeout(() => badge.style.transform = '', 200);
        }
      }
    });

    // Enhanced search functionality with sanitization
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          // Security: Sanitize input
          const searchValue = sanitizeInput(searchInput.value).toLowerCase().trim();
          const allItems = document.querySelectorAll('.toc-item');
          let foundItems = 0;

          if (loadingBar) {
            loadingBar.style.opacity = '1';
            loadingBar.style.width = '70%';
          }

          // Reset display and animations
          allItems.forEach(item => {
            item.style.display = '';
            item.style.animation = '';
          });

          if (noResults) noResults.style.display = 'none';
          document.body.classList.toggle('is-searching', !!searchValue);

          if (searchValue) {
            allItems.forEach(item => {
              const titleEl = item.querySelector('.toc-title');
              const descEl = item.querySelector('.toc-desc');
              let matches = false;

              if (titleEl && titleEl.textContent.toLowerCase().includes(searchValue)) {
                matches = true;
              }
              if (descEl && descEl.textContent.toLowerCase().includes(searchValue)) {
                matches = true;
              }

              const childItems = item.querySelectorAll('.toc-item');
              const hasChildMatch = Array.from(childItems).some(child => {
                const childTitle = child.querySelector('.toc-title');
                const childDesc = child.querySelector('.toc-desc');
                return (childTitle && childTitle.textContent.toLowerCase().includes(searchValue)) ||
                       (childDesc && childDesc.textContent.toLowerCase().includes(searchValue));
              });

              if (matches || hasChildMatch) {
                item.style.display = '';
                foundItems++;
                let parent = item.closest('.subfolder');
                while (parent) {
                  const parentItem = parent.parentElement;
                  parentItem.classList.remove('folder-collapsed');
                  const collapseIcon = parentItem.querySelector('.collapse-icon');
                  const toggle = parentItem.querySelector('.folder-toggle');
                  if (collapseIcon) collapseIcon.textContent = '−';
                  if (toggle) toggle.setAttribute('aria-expanded', 'true');
                  const subfolder = parentItem.querySelector('.subfolder');
                  if (subfolder) subfolder.style.display = 'block';
                  parent = parentItem.closest('.subfolder');
                }
              } else {
                item.style.display = 'none';
              }
            });

            const visibleItems = document.querySelectorAll('.toc-item:not([style*="display: none"])');
            visibleItems.forEach((item, index) => {
              item.style.animation = `fadeSlideIn 0.3s ease forwards ${index * 0.05}s`;
            });

            if (noResults) {
              noResults.style.display = foundItems ? 'none' : 'block';
            }
          } else {
            document.querySelectorAll('.folder-toggle').forEach(toggle => {
              const parentItem = toggle.parentElement;
              parentItem.classList.add('folder-collapsed');
              const collapseIcon = toggle.querySelector('.collapse-icon');
              const subfolder = parentItem.querySelector('.subfolder');
              if (collapseIcon) collapseIcon.textContent = '+';
              if (toggle) toggle.setAttribute('aria-expanded', 'false');
              if (subfolder) {
                subfolder.style.display = 'none';
                subfolder.style.animation = '';
              }
            });
          }

          if (loadingBar) {
            loadingBar.style.width = '100%';
            setTimeout(() => loadingBar.style.opacity = '0', 300);
          }
        }, 300);
      });
    }

    // Handle link clicks with loading indicator
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a:not(.folder-toggle)[href]');
      if (link && loadingBar) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          loadingBar.style.opacity = '1';
          loadingBar.style.width = '50%';
          let width = 50;
          const loadInterval = setInterval(() => {
            if (width >= 80) {
              clearInterval(loadInterval);
            } else {
              width += Math.random() * 5;
              loadingBar.style.width = `${width}%`;
            }
          }, 100);
        }
      }
    });

    // Security: Simple input sanitization
    function sanitizeInput(input) {
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    }
  }

  // Initialize TOC
  fetchAndRenderTOC();
});