// Search and Filter functionality for All Bookings page
document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const filterModal = document.getElementById('filterModal');
    const openFilterBtn = document.getElementById('openFilterModalBtn');
    const closeBtn = document.querySelector('.close-btn');
    const closeModalBtn = document.querySelector('.btn-secondary');

    // Open modal
    if (openFilterBtn) {
        openFilterBtn.addEventListener('click', function() {
            filterModal.style.display = 'block';
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            filterModal.style.display = 'none';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            filterModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === filterModal) {
            filterModal.style.display = 'none';
        }
    });

    // Enhanced search functionality
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('input[name="search_query"]');

    if (searchForm && searchInput) {
        // Real-time search suggestions (optional enhancement)
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length > 0) {
                // You could add AJAX search suggestions here
                console.log('Searching for:', query);
            }
        });

        // Form validation
        searchForm.addEventListener('submit', function(e) {
            const query = searchInput.value.trim();
            if (query.length === 0) {
                e.preventDefault();
                alert('Please enter a search term');
                searchInput.focus();
            }
        });
    }

    // Filter form enhancement
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            // Validate that at least one filter is applied
            const formData = new FormData(this);
            let hasFilters = false;
            
            for (let [key, value] of formData.entries()) {
                if (value && value.trim() !== '') {
                    hasFilters = true;
                    break;
                }
            }

            if (!hasFilters) {
                e.preventDefault();
                alert('Please select at least one filter criteria');
                return;
            }

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Applying...';
                submitBtn.disabled = true;
            }
        });
    }

    // Clear filters functionality
    const clearBtn = document.querySelector('a[href="/bookings"]');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear all form inputs
            const searchInput = document.querySelector('input[name="search_query"]');
            if (searchInput) searchInput.value = '';
            
            // Clear filter modal inputs
            const filterInputs = filterModal.querySelectorAll('input, select');
            filterInputs.forEach(input => {
                if (input.type === 'select-one') {
                    input.selectedIndex = 0;
                } else {
                    input.value = '';
                }
            });
            
            // Redirect to clean bookings page
            window.location.href = '/bookings';
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + F to open filter modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (filterModal) {
                filterModal.style.display = 'block';
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            if (filterModal && filterModal.style.display === 'block') {
                filterModal.style.display = 'none';
            }
        }
    });

    // Auto-close modal after successful filter application
    if (filterForm) {
        filterForm.addEventListener('submit', function() {
            setTimeout(() => {
                filterModal.style.display = 'none';
            }, 1000);
        });
    }

    // Export functionality
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportToCSV();
        });
    }

    function exportToCSV() {
        const table = document.querySelector('table');
        const rows = table.querySelectorAll('tbody tr');
        
        if (rows.length === 0) {
            alert('No data to export');
            return;
        }

        // Get headers
        const headers = [];
        const headerRow = table.querySelector('thead tr');
        headerRow.querySelectorAll('th').forEach(th => {
            headers.push(th.textContent.trim());
        });

        // Get data rows
        const csvData = [];
        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach((td, index) => {
                // Skip the Actions column
                if (index < headers.length - 1) {
                    rowData.push(`"${td.textContent.trim()}"`);
                }
            });
            csvData.push(rowData.join(','));
        });

        // Combine headers and data
        const csvContent = [headers.join(','), ...csvData].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
