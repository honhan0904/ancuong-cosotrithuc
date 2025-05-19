document.addEventListener('DOMContentLoaded', function() {
    // Simulate page loading
    const loadingBar = document.getElementById('loading-bar');
    let width = 0;
    const loadingInterval = setInterval(function() {
        if (width >= 100) {
            clearInterval(loadingInterval);
            loadingBar.style.width = '100%';
            setTimeout(() => {
                loadingBar.style.opacity = '0';
            }, 500);
        } else {
            width += Math.random() * 10;
            loadingBar.style.width = Math.min(width, 100) + '%';
        }
    }, 100);
    
    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Folder toggle handling
    const folderToggles = document.querySelectorAll('.folder-toggle');
    
    folderToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parentItem = this.parentElement;
            const subfolder = parentItem.querySelector('.subfolder');
            const collapseIcon = this.querySelector('.collapse-icon');
            
            // Chỉ áp dụng animation khi không trong trạng thái search
            const isSearching = document.body.classList.contains('is-searching');
            
            if (parentItem.classList.contains('folder-collapsed')) {
                // Opening
                parentItem.classList.remove('folder-collapsed');
                collapseIcon.textContent = '-';
                collapseIcon.style.transform = 'rotate(180deg)';
                
                if (subfolder && !isSearching) {
                    subfolder.style.display = 'block';
                    subfolder.style.animation = 'expandIn 0.3s ease forwards';
                }
            } else {
                // Closing
                parentItem.classList.add('folder-collapsed');
                collapseIcon.textContent = '+';
                collapseIcon.style.transform = 'rotate(0deg)';
                
                if (subfolder && !isSearching) {
                    subfolder.style.animation = 'collapseOut 0.3s ease forwards';
                    setTimeout(() => {
                        if (parentItem.classList.contains('folder-collapsed')) {
                            subfolder.style.display = 'none';
                        }
                    }, 300);
                }
            }
            
            // Add pulse animation to the icon
            this.querySelector('.toc-icon').style.animation = 'iconPulse 0.5s ease';
        });
    });
    
    // Ripple effect
    document.addEventListener('click', function(e) {
        if (e.target.closest('.toc-link')) {
            const link = e.target.closest('.toc-link');
            const ripple = document.createElement('div');
            const rect = link.getBoundingClientRect();
            
            ripple.className = 'ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            
            link.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
    
    // Highlight active item when clicked
    const tocLinks = document.querySelectorAll('.toc-link');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (!this.classList.contains('folder-toggle')) {
                tocLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Department badge click handling
    const departmentBadges = document.querySelectorAll('.department-badge');
    
    departmentBadges.forEach(badge => {
        badge.addEventListener('click', function() {
            const departmentName = this.textContent.trim();
            const searchInput = document.getElementById('search-input');
            searchInput.value = departmentName;
            searchInput.focus();
            
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
            
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
        });
    });
    
    // Enhanced search functionality
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', function() {
        loadingBar.style.opacity = '1';
        loadingBar.style.width = '70%';
        
        const searchValue = this.value.toLowerCase().trim();
        const allItems = document.querySelectorAll('.toc-item, .catalogue-section');
        let foundItems = 0;
        
        // Thêm class để đánh dấu đang trong trạng thái search
        document.body.classList.toggle('is-searching', searchValue !== '');
        
        setTimeout(() => {
            // Reset all highlights and displays
            document.querySelectorAll('.toc-title, .toc-desc, .catalogue-link, .catalogue-title, .showroom-link').forEach(el => {
                el.style.backgroundColor = '';
                el.style.padding = '';
                el.style.borderRadius = '';
                el.style.animation = '';
            });

            // Helper function to check if an element matches search
            function checkElementMatch(element) {
                const titleEl = element.querySelector('.toc-title, .catalogue-title');
                const descEl = element.querySelector('.toc-desc');
                const links = element.querySelectorAll('.catalogue-link, .showroom-link');
                
                let matches = false;
                
                if (searchValue && titleEl && titleEl.textContent.toLowerCase().includes(searchValue)) {
                    titleEl.style.backgroundColor = '#fff3cd';
                    titleEl.style.padding = '2px 5px';
                    titleEl.style.borderRadius = '3px';
                    matches = true;
                }
                
                if (searchValue && descEl && descEl.textContent.toLowerCase().includes(searchValue)) {
                    descEl.style.backgroundColor = '#fff3cd';
                    descEl.style.padding = '2px 5px';
                    descEl.style.borderRadius = '3px';
                    matches = true;
                }
                
                if (searchValue) {
                    links.forEach(link => {
                        if (link.textContent.toLowerCase().includes(searchValue)) {
                            link.style.backgroundColor = '#fff3cd';
                            link.style.borderRadius = '3px';
                            matches = true;
                        }
                    });
                }
                
                return matches;
            }

            // Function to show parent folders
            function showParentFolders(element) {
                let parent = element.closest('.subfolder');
                while (parent) {
                    const parentItem = parent.parentElement;
                    if (parentItem.classList.contains('folder-collapsed')) {
                        parentItem.classList.remove('folder-collapsed');
                        const collapseIcon = parentItem.querySelector('.collapse-icon');
                        if (collapseIcon) collapseIcon.textContent = '-';
                    }
                    parent = parentItem.closest('.subfolder');
                }
            }

            // Reset all items visibility first
            allItems.forEach(item => {
                item.style.display = '';
                item.style.animation = '';
            });

            if (searchValue) {
                // Process all items for search
                allItems.forEach(item => {
                    const hasMatch = checkElementMatch(item);
                    const hasChildMatch = Array.from(item.querySelectorAll('.toc-item, .catalogue-section, .catalogue-link, .showroom-link'))
                        .some(child => checkElementMatch(child));

                    if (hasMatch || hasChildMatch) {
                        item.style.display = '';
                        foundItems++;
                        showParentFolders(item);
                        
                        // Show all child elements if parent matches
                        if (hasMatch) {
                            item.querySelectorAll('.toc-item, .catalogue-section, .catalogue-link, .showroom-link')
                                .forEach(child => child.style.display = '');
                        }
                    } else {
                        item.style.display = 'none';
                    }
                });

                // Animate only visible results
                const visibleItems = document.querySelectorAll('.toc-item:not([style*="display: none"])');
                visibleItems.forEach((item, index) => {
                    item.style.animation = `fadeSlideIn 0.3s ease forwards ${index * 0.05}s`;
                });
            } else {
                // Reset to initial state when no search
                document.querySelectorAll('.folder-toggle').forEach(toggle => {
                    const parentItem = toggle.parentElement;
                    parentItem.classList.add('folder-collapsed');
                    const collapseIcon = toggle.querySelector('.collapse-icon');
                    if (collapseIcon) collapseIcon.textContent = '+';
                });

                // Clear all animations
                document.querySelectorAll('.toc-item').forEach(item => {
                    item.style.animation = '';
                });
            }

            // Complete loading bar
            loadingBar.style.width = '100%';
            setTimeout(() => {
                loadingBar.style.opacity = '0';
            }, 500);
        }, 300);
    });
    
    // Handle link clicks with loading indicator
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        if ((target.tagName === 'A' && target.getAttribute('href') && !target.classList.contains('folder-toggle')) || 
            target.closest('a:not(.folder-toggle)[href]')) {
            
            const link = target.tagName === 'A' ? target : target.closest('a');
            const href = link.getAttribute('href');
            
            if (href && !href.startsWith('#')) {
                loadingBar.style.opacity = '1';
                loadingBar.style.width = '50%';
                
                let width = 50;
                const loadInterval = setInterval(function() {
                    if (width >= 80) {
                        clearInterval(loadInterval);
                    } else {
                        width += Math.random() * 5;
                        loadingBar.style.width = width + '%';
                    }
                }, 100);
            }
        }
    });
});