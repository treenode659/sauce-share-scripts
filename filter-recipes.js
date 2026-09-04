// ============================================
// FILTER TOGGLE (open/close dropdowns)
// ============================================
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.filter-trigger_bar').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      if (window._filterCardActive) return;
      var isOpen = this.classList.toggle('is-open');
      if (isOpen) {
        this.style.backgroundColor = "#f4e1c7";
        this.style.borderRadius = "10px 10px 0 0";
      } else {
        this.style.backgroundColor = "#f9f5ef";
        this.style.borderRadius = "10px";
      }
    });
  });

  // Mobile filter bar trigger
  document.querySelectorAll('.filter-bar_trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      this.classList.toggle('is-open');
    });
  });
});

// ============================================
// CARD TITLE CLICK — navigate to recipe page
// ============================================
document.addEventListener('click', function(e) {
  var title = e.target.closest('[wized="card-title"]');
  if (!title) return;
  var card = title.closest('.recipe-card');
  if (!card) return;
  var slug = card.getAttribute('data-slug');
  if (slug) {
    window.location.href = '/recipe?slug=' + slug;
  }
});

// ============================================
// ACCORDION (recipe card ingredient toggle)
// ============================================
document.addEventListener('click', function(e) {
  var trigger = e.target.closest('.accordion_closed');
  if (!trigger) return;

  var addRecipeCard = trigger.closest('.add-recipe_card');
  if (addRecipeCard) {
    if (!window._filterCardSession) {
      // Force the details wrapper closed — Webflow's native interaction
      // will open it before this runs, so we shut it immediately after.
      setTimeout(function() {
        var wrapper = addRecipeCard.querySelector('.add-recipe_section-details-wrapper');
        if (wrapper) wrapper.style.setProperty('display', 'none', 'important');
      }, 0);

      var existing = document.getElementById('fc-toast');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.id = 'fc-toast';
      toast.innerText = 'Log in or become a member to upload recipes.';
      toast.style.cssText = [
        'position:fixed',
        'bottom:24px',
        'left:50%',
        'transform:translateX(-50%)',
        'background:#2e2a26',
        'color:#f9f5ef',
        'padding:12px 20px',
        'border-radius:8px',
        'font-size:14px',
        'z-index:99999',
        'opacity:0',
        'transition:opacity 0.3s ease',
        'pointer-events:none',
        'white-space:nowrap'
      ].join(';');
      document.body.appendChild(toast);
      requestAnimationFrame(function() {
        requestAnimationFrame(function() { toast.style.opacity = '1'; });
      });
      setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
      }, 3000);
    }
    return;
  }

  var card = trigger.closest('.recipe-card');
  if (!card) return;
  var content = card.querySelector('.recipe-card_ingredient-content');
  var arrow = card.querySelector('.arrow-accordion_wrap');
  if (!content) return;
  var isHidden = getComputedStyle(content).display === 'none';
  if (isHidden) {
    content.style.display = 'flex';
    content.style.opacity = '0';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        content.style.opacity = '1';
      });
    });
  } else {
    content.style.opacity = '0';
    setTimeout(function() { content.style.display = 'none'; }, 250);
  }
  if (arrow) {
    arrow.style.transition = 'transform 0.3s ease';
    arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }
});

// ============================================
// BASE SELECTED TOGGLE (show/hide base options)
// ============================================
document.addEventListener('click', function(e) {
  var trigger = e.target.closest('.base-selected');
  if (!trigger) return;
  var optionsWrap = document.querySelector('.base-options_wrap');
  if (!optionsWrap) return;
  var isHidden = getComputedStyle(optionsWrap).display === 'none';
  if (isHidden) {
    optionsWrap.style.display = 'flex';
    optionsWrap.style.opacity = '0';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        optionsWrap.style.opacity = '1';
      });
    });
  } else {
    optionsWrap.style.opacity = '0';
    setTimeout(function() { optionsWrap.style.display = 'none'; }, 250);
  }
});

// ============================================
// CHARACTER COUNTER
// ============================================
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('[counter-target="input"]').forEach(function(input) {
    var max = parseInt(input.getAttribute('maxlength')) || 500;
    var min = parseInt(input.getAttribute('minlength')) || 0;
    var parent = input.closest('.form-field_control') || input.parentElement;
    var counter = parent.querySelector('[counter-target="display"]');
    var isList = input.getAttribute('is-list') === 'true';
    if (counter) counter.innerText = '0 / ' + max + ' Characters';
    if (isList) {
      input.addEventListener("focus", function() {
        if (input.value.trim() === "") input.value = "• ";
      });
      input.addEventListener("keydown", function(e) {
        if (e.key === 'Enter') {
          setTimeout(function() {
            var pos = input.selectionStart;
            var before = input.value.substring(0, pos);
            if (!before.endsWith('• ')) {
              input.value = before + '• ' + input.value.substring(pos);
              input.selectionStart = input.selectionEnd = pos + 2;
            }
          }, 10);
        }
      });
    }
    input.addEventListener("input", function() {
      var len = input.value.length;
      if (!counter) return;
      if (min > 0 && len < min && len > 0) {
        counter.innerText = 'Needs min ' + min + ' characters';
        counter.style.color = "#D77F42";
      } else if (len > max) {
        counter.innerText = len + ' / ' + max + ' Characters';
        counter.style.color = "#ff4d4d";
      } else if (len >= min && len <= max && len > 0) {
        counter.innerText = len + ' / ' + max + ' Characters';
        counter.style.color = "#64794E";
      } else {
        counter.innerText = '0 / ' + max + ' Characters';
        counter.style.color = "";
      }
    });
  });
});

// ============================================
// PILL INTERACTIONS (share recipe form)
// ============================================
(function() {
  var CUISINE_SELECTOR   = '[data-wized="selected_cuisines"]';
  var PANTRY_SELECTOR    = '[data-wized="pantry_check"]';
  var FLAVOR_SELECTOR    = '[wized="flavor_profile"]';
  var USAGE_SELECTOR     = '[wized="usage_types"]';
  var GOES_WITH_SELECTOR = '[wized="goes_with"]';
  var PREP_SELECTOR      = '[wized="prep_time"]';
  var BASE_SELECTOR      = '[wized="base_pairing"]';

  window.pillState = {
    selected_cuisines:    [],
    selected_flavors:     [],
    selected_usage_types: [],
    selected_goes_with:   [],
    selected_pantry:      [],
    prep_time:            null,
    base_pairing:         null
  };

  function swapElements(el1, el2) {
    var parent1 = el1.parentNode;
    var parent2 = el2.parentNode;
    if (!parent1 || !parent2) return;
    var placeholder = document.createElement('div');
    parent1.insertBefore(placeholder, el1);
    parent2.insertBefore(el1, el2);
    parent1.insertBefore(el2, placeholder);
    parent1.removeChild(placeholder);
  }

  function closeBaseOptions() {
    var optionsWrap = document.querySelector('.base-options_wrap');
    if (!optionsWrap) return;
    optionsWrap.style.opacity = '0';
    setTimeout(function() { optionsWrap.style.display = 'none'; }, 250);
  }

  function syncToWized() {
    if (!window.Wized || !Wized.data) return;
    if (Wized.data.v) {
      Wized.data.v.selected_cuisines    = window.pillState.selected_cuisines;
      Wized.data.v.selected_flavors     = window.pillState.selected_flavors;
      Wized.data.v.selected_usage_types = window.pillState.selected_usage_types;
      Wized.data.v.selected_goes_with   = window.pillState.selected_goes_with;
      Wized.data.v.selected_pantry      = window.pillState.selected_pantry;
      Wized.data.v.base_pairing         = window.pillState.base_pairing;
    }
    if (Wized.data.i) {
      Wized.data.i.prep_time = window.pillState.prep_time;
    }
  }

  document.addEventListener('click', function(e) {
    if (e.target.closest('.add-recipe_expand-btn') || e.target.closest('.add-recipe_shrink-btn')) return;
    var cuisinePill  = e.target.closest(CUISINE_SELECTOR);
    var pantryPill   = e.target.closest(PANTRY_SELECTOR);
    var flavorPill   = e.target.closest(FLAVOR_SELECTOR);
    var usagePill    = e.target.closest(USAGE_SELECTOR);
    var goesWithPill = e.target.closest(GOES_WITH_SELECTOR);
    var prepPill     = e.target.closest(PREP_SELECTOR);
    var basePill     = e.target.closest(BASE_SELECTOR);
    if (!cuisinePill && !pantryPill && !flavorPill && !usagePill && !goesWithPill && !prepPill && !basePill) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (cuisinePill)       handleCuisineLogic(cuisinePill);
    else if (pantryPill)   handleMultiSelect(pantryPill,   'selected_pantry',      8);
    else if (flavorPill)   handleMultiSelect(flavorPill,   'selected_flavors',     3);
    else if (usagePill)    handleMultiSelect(usagePill,    'selected_usage_types', 3);
    else if (goesWithPill) handleMultiSelect(goesWithPill, 'selected_goes_with',   3);
    else if (prepPill) {
      window.pillState.prep_time = prepPill.getAttribute('data-value');
    }
    else if (basePill) {
      var newValue     = basePill.getAttribute('data-value');
      var currentValue = window.pillState.base_pairing;
      if (currentValue && currentValue !== newValue) {
        var currentPill = document.querySelector(BASE_SELECTOR + '[data-value="' + currentValue + '"]');
        if (currentPill) swapElements(currentPill, basePill);
      }
      window.pillState.base_pairing = newValue;
      closeBaseOptions();
    }
    syncToWized();
    window.syncAllUI();
  }, true);

  function handleMultiSelect(pill, varName, limit) {
    var current = window.pillState[varName].slice();
    var val = pill.getAttribute('data-value');
    if (current.includes(val)) {
      current = current.filter(function(f) { return f !== val; });
    } else if (current.length < limit) {
      current.push(val);
    }
    window.pillState[varName] = current;
  }

  function handleCuisineLogic(pill) {
    var current = window.pillState.selected_cuisines.slice();
    var val = pill.getAttribute('data-value');
    if (val === 'General') {
      current = current.includes('General') ? [] : ['General'];
    } else {
      current = current.filter(function(f) { return f !== 'General'; });
      if (current.includes(val)) {
        current = current.filter(function(f) { return f !== val; });
      } else if (current.length < 2) {
        current.push(val);
      }
    }
    window.pillState.selected_cuisines = current;
  }

  window.syncAllUI = function() {
    syncCheckboxes(CUISINE_SELECTOR,  window.pillState.selected_cuisines);
    syncCheckboxes(PANTRY_SELECTOR,   window.pillState.selected_pantry);
    renderPills(FLAVOR_SELECTOR,      window.pillState.selected_flavors,     true);
    renderPills(USAGE_SELECTOR,       window.pillState.selected_usage_types, true);
    renderPills(GOES_WITH_SELECTOR,   window.pillState.selected_goes_with,   true);
    renderPills(PREP_SELECTOR,        window.pillState.prep_time    ? [window.pillState.prep_time]    : [], false);
    renderPills(BASE_SELECTOR,        window.pillState.base_pairing ? [window.pillState.base_pairing] : [], false);
    validateForm();
  };

  function syncCheckboxes(selector, selectedData) {
    document.querySelectorAll(selector).forEach(function(p) {
      var val = p.getAttribute('data-value');
      var checkbox = p.tagName === 'INPUT' ? p : p.querySelector('input[type="checkbox"]');
      if (checkbox) {
        var shouldBeChecked = selectedData.includes(val);
        checkbox.checked = shouldBeChecked;
        var customCheck = checkbox.previousElementSibling;
        if (customCheck && customCheck.classList.contains('w-checkbox-input')) {
          if (shouldBeChecked) customCheck.classList.add('w--redirected-checked');
          else customCheck.classList.remove('w--redirected-checked');
        }
      }
    });
  }

  function renderPills(selector, selectedData, showExit) {
    document.querySelectorAll(selector).forEach(function(p) {
      var isSelected = selectedData.includes(p.getAttribute('data-value'));
      var exitIcon = p.querySelector('.pill_exit-icon');
      if (isSelected) {
        p.classList.add('pill-is-selected');
        p.style.backgroundColor = "#D77F42";
        p.style.color = "#2e2a26";
        if (showExit && exitIcon) exitIcon.style.display = 'flex';
      } else {
        p.classList.remove('pill-is-selected');
        p.style.backgroundColor = "";
        p.style.color = "";
        if (exitIcon) exitIcon.style.display = 'none';
      }
    });
  }

  function validateForm() {
    var btn = document.querySelector('[wized="submit_button"]');
    if (!btn) return;
    var allConstraintFields = ['recipe_title', 'ingredients', 'directions', 'servings', 'recipe_blurb', 'note_blurb', 'note_tried', 'sauce_story', 'note_details'];
    var requiredFields      = ['recipe_title', 'ingredients', 'directions', 'servings', 'recipe_blurb', 'note_blurb', 'note_tried'];
    var allTextValid    = true;
    var missingRequired = false;
    allConstraintFields.forEach(function(attrName) {
      var el = document.querySelector('[wized="' + attrName + '"], [data-wized="' + attrName + '"]');
      if (!el) return;
      var val        = el.value.trim();
      var min        = parseInt(el.getAttribute('minlength')) || 0;
      var isRequired = requiredFields.includes(attrName);
      var isEmpty    = val.length === 0;
      var meetsMin   = val.length >= min;
      if (isRequired && isEmpty)      { allTextValid = false; missingRequired = true; }
      else if (!isEmpty && !meetsMin) { allTextValid = false; el.style.borderBottom = "2px solid #D77F42"; }
      else                            { el.style.borderBottom = ""; }
    });
    var hasCuisines = window.pillState.selected_cuisines.length    > 0;
    var hasFlavors  = window.pillState.selected_flavors.length     > 0;
    var hasUsage    = window.pillState.selected_usage_types.length > 0;
    var hasPrep     = !!window.pillState.prep_time;
    var hasBase     = !!window.pillState.base_pairing;
    var pantryCount = window.pillState.selected_pantry.length;
    var pantryValid = (pantryCount === 0) || (pantryCount >= 2 && pantryCount <= 8);
    var isFormValid = allTextValid && pantryValid && hasCuisines && hasFlavors && hasUsage && hasPrep && hasBase;
    if (isFormValid) {
      btn.style.opacity       = "1";
      btn.style.pointerEvents = "auto";
      btn.innerText           = "Share My Sauce";
      btn.removeAttribute('disabled');
    } else {
      btn.style.opacity       = "0.4";
      btn.style.pointerEvents = "none";
      btn.setAttribute('disabled', 'true');
      if      (missingRequired) btn.innerText = "Finish required details...";
      else if (!allTextValid)   btn.innerText = "Check character counts...";
      else if (!pantryValid)    btn.innerText = "Select 2–8 ingredients...";
      else if (!hasCuisines)    btn.innerText = "Select a cuisine...";
      else if (!hasFlavors)     btn.innerText = "Select flavor profiles...";
      else if (!hasUsage)       btn.innerText = "Select usage types...";
      else if (!hasPrep)        btn.innerText = "Select prep time...";
      else if (!hasBase)        btn.innerText = "Select a base pairing...";
    }
  }

  document.addEventListener('input', validateForm);

  window.addEventListener('load', function() {
    var params      = new URLSearchParams(window.location.search);
    var baseFromUrl = params.get('base');
    var attempts    = 0;
    function tryInit() {
      attempts++;
      if (window.Wized && Wized.data && Wized.data.v) {
        var rawBase    = baseFromUrl || 'beef';
        var pillValue  = rawBase;
        var targetPill = document.querySelector(BASE_SELECTOR + '[data-value="' + rawBase + '"]');
        if (!targetPill) {
          pillValue  = rawBase.replace(/-/g, '/');
          targetPill = document.querySelector(BASE_SELECTOR + '[data-value="' + pillValue + '"]');
        }
        window.pillState.base_pairing = pillValue;
        Wized.data.v.base_pairing     = pillValue;
        var beefPill = document.querySelector(BASE_SELECTOR + '[data-value="beef"]');
        if (beefPill && targetPill && beefPill !== targetPill) {
          swapElements(beefPill, targetPill);
        }
        window.syncAllUI();
      } else if (attempts < 20) {
        setTimeout(tryInit, 100);
      }
    }
    tryInit();
  });
})();

// ============================================
// BASE FILTER BUTTON
// ============================================
(function() {
  var selectedBase = null;
  var params = new URLSearchParams(window.location.search);
  var baseFromUrl = params.get('base');
  if (baseFromUrl) selectedBase = baseFromUrl;

  function updateButton() {
    var btn = document.querySelector('[wized="base-filter-btn"]');
    if (!btn) return;
    btn.style.opacity       = selectedBase ? '1'    : '0.5';
    btn.style.pointerEvents = selectedBase ? 'auto' : 'none';
  }

  document.addEventListener('change', function(e) {
    var input = e.target;
    if (input.name !== 'base-filter') return;
    selectedBase = input.value;
    updateButton();
  });

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[wized="base-filter-btn"]');
    if (!btn) return;
    if (!selectedBase) return;
    e.preventDefault();
    window.location.href = '/filter-recipes?base=' + selectedBase;
  });

  document.addEventListener('DOMContentLoaded', function() {
    updateButton();
  });
})();

// ============================================
// FILTER RECIPES (main filtering logic)
// ============================================
(function() {
  var allRecipes      = [];
  var filteredResults = [];
  var recipesPerPage  = 6;

  var activeFilters = {
    dish_type:         [],
    flavor:            [],
    usage:             [],
    cuisine:           [],
    author_role:       [],
    base:              null,
    prep:              null,
    _flavorOverridden: false
  };

  window._resetFilterBar = function() {
    activeFilters.dish_type         = [];
    activeFilters.flavor            = [];
    activeFilters.usage             = [];
    activeFilters.cuisine           = [];
    activeFilters.author_role       = [];
    activeFilters.prep              = null;
    activeFilters._flavorOverridden = false;

    document.querySelectorAll('[data-filter] input[type="checkbox"], [data-filter] input[type="radio"]').forEach(function(input) {
      input.checked = false;
      var customCheck = input.previousElementSibling;
      if (customCheck) {
        customCheck.classList.remove('w--redirected-checked');
      }
    });

    document.querySelectorAll('.filter-trigger_bar.is-open').forEach(function(trigger) {
      trigger.classList.remove('is-open');
      trigger.style.backgroundColor = "#f9f5ef";
      trigger.style.borderRadius    = "10px";
    });

    document.querySelectorAll('.filter-list_bar').forEach(function(bar) {
      bar.style.display = 'none';
    });
  };

  function lockFilterBar() {
    document.querySelectorAll('.filter-trigger_bar, .filter-bar_trigger').forEach(function(trigger) {
      trigger.style.opacity       = '0.4';
      trigger.style.pointerEvents = 'none';
      trigger.style.cursor        = 'default';
    });
  }

  function unlockFilterBar() {
    document.querySelectorAll('.filter-trigger_bar, .filter-bar_trigger').forEach(function(trigger) {
      trigger.style.opacity       = '';
      trigger.style.pointerEvents = '';
      trigger.style.cursor        = '';
    });
  }

  window._lockFilterBar   = lockFilterBar;
  window._unlockFilterBar = unlockFilterBar;

  function formatBase(base) {
    var slashBases = ['pasta-noodles', 'rice-grains'];
    if (slashBases.includes(base)) {
      return base.replace(/-/g, '/').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    }
    return base.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
  }

  function updatePaginationUI() {
    var page  = Wized.data.v.current_page || 1;
    var total = Wized.data.v.total_pages  || 1;
    var indicator = document.querySelector('[wized="page-indicator"]');
    if (indicator) indicator.innerText = 'Page ' + page + ' of ' + total;
    var prevBtn = document.querySelector('[wized="prev-page-btn"]');
    var nextBtn = document.querySelector('[wized="next-page-btn"]');
    if (prevBtn) {
      prevBtn.style.opacity       = page > 1     ? '1'    : '0.4';
      prevBtn.style.pointerEvents = page > 1     ? 'auto' : 'none';
    }
    if (nextBtn) {
      nextBtn.style.opacity       = page < total ? '1'    : '0.4';
      nextBtn.style.pointerEvents = page < total ? 'auto' : 'none';
    }
  }

  function applyFilters() {
    var results = allRecipes.filter(function(recipe) {
      if (activeFilters.base) {
        if (!recipe.base_pairing || recipe.base_pairing.toLowerCase() !== activeFilters.base.toLowerCase()) return false;
      }
      if (activeFilters.flavor.length > 0) {
        if (!recipe.flavor_profile || recipe.flavor_profile.length === 0) return false;
        var rf = recipe.flavor_profile.map(function(f) { return f.toLowerCase(); });
        if (!activeFilters.flavor.some(function(f) { return rf.includes(f.toLowerCase()); })) return false;
      }
      if (activeFilters.dish_type.length > 0) {
        if (!recipe.goes_with || recipe.goes_with.length === 0) return false;
        var rg = recipe.goes_with.map(function(g) { return g.toLowerCase(); });
        if (!activeFilters.dish_type.some(function(d) { return rg.includes(d.toLowerCase()); })) return false;
      }
      if (activeFilters.usage.length > 0) {
        if (!recipe.usage_types || recipe.usage_types.length === 0) return false;
        var ru = recipe.usage_types.map(function(u) { return u.toLowerCase(); });
        if (!activeFilters.usage.some(function(u) { return ru.includes(u.toLowerCase()); })) return false;
      }
      if (activeFilters.prep) {
        if (!recipe.prep_time || recipe.prep_time.toLowerCase() !== activeFilters.prep.toLowerCase()) return false;
      }
      if (activeFilters.cuisine.length > 0) {
        if (!recipe.cuisines || recipe.cuisines.length === 0) return false;
        var rc = recipe.cuisines.map(function(c) { return c.toLowerCase(); });
        if (!activeFilters.cuisine.some(function(c) { return rc.includes(c.toLowerCase()); })) return false;
      }
      if (activeFilters.author_role.length > 0) {
        if (!recipe.author_role) return false;
        if (!activeFilters.author_role.includes(recipe.author_role)) return false;
      }
      return true;
    });

    filteredResults = results;
    var totalPages = Math.ceil(results.length / recipesPerPage);
    Wized.data.v.total_pages  = totalPages || 1;
    Wized.data.v.current_page = 1;
    var pageResults = results.slice(0, recipesPerPage);
    Wized.data.v.recipe_results  = pageResults.length > 0 ? pageResults : [];
    Wized.data.v.no_results      = results.length === 0;
    if (results.length > 0) Wized.data.v.show_add_recipe = false;
    Wized.data.v.selected_base_filter = activeFilters.base ? formatBase(activeFilters.base) : '';
    updatePaginationUI();
  }

  document.addEventListener('click', function(e) {
    var prev = e.target.closest('[wized="prev-page-btn"]');
    var next = e.target.closest('[wized="next-page-btn"]');
    if (!prev && !next) return;
    var currentPage = Wized.data.v.current_page || 1;
    if (prev && currentPage > 1) {
      Wized.data.v.current_page = currentPage - 1;
    } else if (next && currentPage < Wized.data.v.total_pages) {
      Wized.data.v.current_page = currentPage + 1;
    }
    var start = (Wized.data.v.current_page - 1) * recipesPerPage;
    Wized.data.v.recipe_results = filteredResults.slice(start, start + recipesPerPage);
    updatePaginationUI();
    var recipeSection = document.querySelector('.recipe-list_section') || document.querySelector('[wized="recipes-grid"]');
    if (recipeSection) {
      recipeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.addEventListener('change', function(e) {
    if (window._filterCardActive) return;

    var input      = e.target;
    var filterItem = input.closest('[data-filter]');
    if (!filterItem) return;
    var filterType  = filterItem.getAttribute('data-filter');
    var filterValue = filterItem.getAttribute('data-value');
    if (filterType === 'dish_type') {
      if (input.checked) {
        if (!activeFilters.dish_type.includes(filterValue)) activeFilters.dish_type.push(filterValue);
      } else {
        activeFilters.dish_type = activeFilters.dish_type.filter(function(v) { return v !== filterValue; });
      }
    } else if (filterType === 'flavor') {
      if (!activeFilters._flavorOverridden) {
        activeFilters.flavor = [];
        activeFilters._flavorOverridden = true;
      }
      if (input.checked) {
        if (!activeFilters.flavor.includes(filterValue)) activeFilters.flavor.push(filterValue);
      } else {
        activeFilters.flavor = activeFilters.flavor.filter(function(v) { return v !== filterValue; });
      }
    } else if (filterType === 'usage') {
      if (input.checked) {
        if (!activeFilters.usage.includes(filterValue)) activeFilters.usage.push(filterValue);
      } else {
        activeFilters.usage = activeFilters.usage.filter(function(v) { return v !== filterValue; });
      }
    } else if (filterType === 'base') {
      activeFilters.base = input.checked ? filterValue : null;
      if (!input.checked) Wized.data.v.selected_base_filter = '';
    } else if (filterType === 'prep') {
      activeFilters.prep = input.checked ? filterValue : null;
    } else if (filterType === 'cuisine') {
      if (input.checked) {
        if (!activeFilters.cuisine.includes(filterValue)) activeFilters.cuisine.push(filterValue);
      } else {
        activeFilters.cuisine = activeFilters.cuisine.filter(function(v) { return v !== filterValue; });
      }
    } else if (filterType === 'author_role') {
      if (input.checked) {
        if (!activeFilters.author_role.includes(filterValue)) activeFilters.author_role.push(filterValue);
      } else {
        activeFilters.author_role = activeFilters.author_role.filter(function(v) { return v !== filterValue; });
      }
    }
    applyFilters();
  });

  var checkWized = setInterval(function() {
    if (window.Wized && Wized.data && Wized.data.v) {
      clearInterval(checkWized);
      setTimeout(function() {
        var params         = new URLSearchParams(window.location.search);
        var baseFromUrl    = params.get('base');
        var flavorsFromUrl = params.get('flavors');
        Wized.data.v.current_base = baseFromUrl || 'default';
        if (baseFromUrl)    activeFilters.base   = baseFromUrl;
        if (flavorsFromUrl) activeFilters.flavor = flavorsFromUrl.split(',');
        Wized.requests.execute('getFilteredRecipes').then(function() {
          allRecipes = Wized.data.r.getFilteredRecipes.data || [];
          applyFilters();
          setTimeout(function() {
            allRecipes = Wized.data.r.getFilteredRecipes.data || [];
            applyFilters();
          }, 600);
          if (activeFilters.base) {
            setTimeout(function() {
              var baseRadio = document.querySelector('input[name="base-filter"][value="' + activeFilters.base + '"]');
              if (baseRadio) {
                baseRadio.checked = true;
                var customCheck = baseRadio.previousElementSibling;
                if (customCheck && customCheck.classList.contains('w-radio-input')) {
                  customCheck.classList.add('w--redirected-checked');
                }
              }
            }, 200);
          }
        });
      }, 800);
    }
  }, 100);

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[wized="clear-filters-btn"]');
    if (!btn) return;
    var params     = new URLSearchParams(window.location.search);
    var base       = params.get('base');
    var flavors    = params.get('flavors');
    var newUrl     = '/filter-recipes';
    var queryParts = [];
    if (base)    queryParts.push('base='    + base);
    if (flavors) queryParts.push('flavors=' + flavors);
    if (queryParts.length > 0) newUrl += '?' + queryParts.join('&');
    window.location.href = newUrl;
  });
})();

// ============================================
// EMPTY STATE ADD RECIPE BUTTON
// ============================================
document.addEventListener('click', function(e) {
  var btn = e.target.closest('[wized="show-add-recipe-btn"]');
  if (!btn) return;
  window._filterCardAddRecipeOpen = true;
  var emptyEl = document.querySelector('[wized="filter-card-empty"]');
  if (emptyEl) emptyEl.style.display = 'none';
  var addCard = document.querySelector('[wized="add-recipe-card"]');
  if (addCard) {
    addCard.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    addCard.style.opacity    = '0';
    addCard.style.transform  = 'translateY(20px)';
    addCard.style.display    = 'block';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        addCard.style.opacity   = '1';
        addCard.style.transform = 'translateY(0)';
      });
    });
  }
  Wized.data.v.show_add_recipe = true;
  Wized.data.v.no_results      = false;
});

// ============================================
// ADD RECIPE CARD EXPAND (modal mode)
// ============================================
document.addEventListener('click', function(e) {
  var expandBtn   = e.target.closest('.add-recipe_expand-btn');
  var shrinkBtn   = e.target.closest('.add-recipe_shrink-btn');
  if (!expandBtn && !shrinkBtn) return;
  var card        = document.querySelector('.add-recipe_card');
  var cardWrap    = document.querySelector('.add-recipe_card-wrap');
  var expandBtnEl = document.querySelector('.add-recipe_expand-btn');
  var shrinkBtnEl = document.querySelector('.add-recipe_shrink-btn');
  if (!card) return;
  if (expandBtn) {
    if (cardWrap) cardWrap.style.minHeight = cardWrap.offsetHeight + 'px';
    card.style.position     = 'fixed';
    card.style.top          = '0';
    card.style.left         = '50%';
    card.style.transform    = 'translateX(-50%)';
    card.style.width        = '100%';
    card.style.maxWidth     = 'var(--container-large, 90rem)';
    card.style.height       = '100vh';
    card.style.zIndex       = '9999';
    card.style.overflowY    = 'auto';
    card.style.borderRadius = '0';
    card.style.margin       = '0';
    card.style.boxSizing    = 'border-box';
    card.style.padding      = '2rem';
    document.body.style.overflow = 'hidden';
    if (expandBtnEl) expandBtnEl.style.display = 'none';
    if (shrinkBtnEl) shrinkBtnEl.style.display = 'block';
  }
  if (shrinkBtn) {
    if (cardWrap) cardWrap.style.minHeight = '';
    card.style.position     = '';
    card.style.top          = '';
    card.style.left         = '';
    card.style.transform    = '';
    card.style.width        = '';
    card.style.maxWidth     = '';
    card.style.height       = '';
    card.style.zIndex       = '';
    card.style.overflowY    = '';
    card.style.borderRadius = '';
    card.style.margin       = '';
    card.style.boxSizing    = '';
    card.style.padding      = '';
    document.body.style.overflow = '';
    if (shrinkBtnEl) shrinkBtnEl.style.display = 'none';
    if (expandBtnEl) expandBtnEl.style.display = 'block';
  }
});

// ============================================
// UPLOAD / AUTH
// ============================================
window.addEventListener('load', function() {
  setTimeout(async function() {
    var authToken = null;
    var _supabase = null;

    try {
      _supabase = supabase.createClient(
        'https://houohobadselkswaxwsy.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW9ob2JhZHNlbGtzd2F4d3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM0NTIsImV4cCI6MjA4OTY4OTQ1Mn0.hOBki3aRyTqOFy3CJZmrNBBULDoRxb9xRjz8iDUEMjo'
      );
      const { data } = await _supabase.auth.getSession();
      if (data?.session?.access_token) {
        authToken = data.session.access_token;
      }
    } catch(e) {}

    const input  = document.getElementById('photo-upload-input');
    const button = document.querySelector('[wized="choose-file"]');

    if (input && button) {
      button.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        input.click();
      });

      input.addEventListener('change', function() {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            var MAX_WIDTH  = 1200;
            var MAX_HEIGHT = 1200;
            var width  = img.width;
            var height = img.height;
            if (width > MAX_WIDTH)  { height = (MAX_WIDTH  / width)  * height; width  = MAX_WIDTH;  }
            if (height > MAX_HEIGHT){ width  = (MAX_HEIGHT / height) * width;  height = MAX_HEIGHT; }
            canvas.width  = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            canvas.toBlob(async function(blob) {
              var compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
              var statusEl = document.querySelector('.text-add-recipe-status');
              if (statusEl) statusEl.textContent = 'Uploading...';
              if (authToken) {
                try {
                  var formData = new FormData();
                  formData.append('file', compressedFile);
                  var response = await fetch('https://houohobadselkswaxwsy.supabase.co/functions/v1/validate-upload', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + authToken },
                    body: formData
                  });
                  var result = await response.json();
                  if (result.photo_url && window.Wized) {
                    window.Wized.data.v.photo_url  = result.photo_url;
                    window.Wized.data.v.photo_path = result.path;
                    var displayName = file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
                    if (statusEl) statusEl.textContent = displayName;
                  } else {
                    if (statusEl) statusEl.textContent = 'Upload failed';
                  }
                } catch(err) {
                  if (statusEl) statusEl.textContent = 'Upload failed';
                }
              }
            }, 'image/jpeg', 0.8);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    var submitBtn = document.querySelector('[wized="submit_button"]');
    if (submitBtn && _supabase) {
      try {
        var { data: session } = await _supabase.auth.getSession();
        var userId = session?.session?.user?.id;
        if (userId) {
          var { data: canCreate } = await _supabase.rpc('check_can_create_recipe', { check_user_id: userId });
          if (!canCreate) {
            submitBtn.style.display = 'none';
            var limitMessage = document.createElement('div');
            limitMessage.textContent = 'You have reached your daily recipe limit. Please try again tomorrow.';
            limitMessage.style.cssText = 'padding: 16px; text-align: center; color: #c00; font-weight: bold;';
            submitBtn.parentNode.insertBefore(limitMessage, submitBtn.nextSibling);
          }
        }
      } catch(err) {}
    }

  }, 1000);
});

// ============================================
// FILTER CARD (favorites / recipes / notes)
// ============================================
(function() {
  var SUPABASE_URL = 'https://houohobadselkswaxwsy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW9ob2JhZHNlbGtzd2F4d3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM0NTIsImV4cCI6MjA4OTY4OTQ1Mn0.hOBki3aRyTqOFy3CJZmrNBBULDoRxb9xRjz8iDUEMjo';

  var _supabase          = null;
  var _session           = null;
  var _activeFilter      = null;
  var _filterCardResults = [];
  var _triedOnMap        = {};
  var _recipesPerPage    = 6;

  function getBaseFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('base') || null;
  }

  function getElements() {
    return {
      loggedOut:     document.querySelector('[wized="filter-card-logged-out"]'),
      empty:         document.querySelector('[wized="filter-card-empty"]'),
      addRecipeCard: document.querySelector('[wized="add-recipe-card"]')
    };
  }

  function setEmptyStates(loggedOut, empty) {
    var els = getElements();
    if (els.loggedOut) els.loggedOut.style.display = loggedOut ? 'flex' : 'none';
    if (els.empty)     els.empty.style.display     = empty     ? 'flex' : 'none';
    if ((loggedOut || empty) && els.addRecipeCard) els.addRecipeCard.style.display = 'none';
    if (loggedOut || empty) {
      document.querySelectorAll('.recipe-card').forEach(function(card) {
        card.style.display = 'none';
      });
    } else {
      document.querySelectorAll('.recipe-card').forEach(function(card) {
        card.style.display = '';
      });
    }
  }

  function hideAllFilterCardStates() {
    var els = getElements();
    if (els.loggedOut) els.loggedOut.style.display = 'none';
    if (els.empty)     els.empty.style.display     = 'none';
  }

  function applyNotesCardUI(isNotesActive) {
    document.querySelectorAll('.recipe-card').forEach(function(card) {
      var baseWrapper    = card.querySelector('[wized="card-base-wrapper"]');
      var flavorsWrapper = card.querySelector('[wized="card-flavors-wrapper"]');
      var triedOnWrapper = card.querySelector('[wized="card-tried-on-wrapper"]');
      var triedOnText    = card.querySelector('[wized="card-tried-on-text"]');

      if (isNotesActive) {
        if (baseWrapper)    baseWrapper.style.display    = 'none';
        if (flavorsWrapper) flavorsWrapper.style.display = 'none';
        if (triedOnWrapper) triedOnWrapper.style.display = 'flex';
        if (triedOnText) {
          var recipeId = card.getAttribute('data-recipe-id') || null;
          if (recipeId && _triedOnMap[recipeId]) {
            triedOnText.innerText = _triedOnMap[recipeId];
          } else {
            triedOnText.innerText = '';
          }
        }
      } else {
        if (baseWrapper)    baseWrapper.style.display    = '';
        if (flavorsWrapper) flavorsWrapper.style.display = '';
        if (triedOnWrapper) triedOnWrapper.style.display = 'none';
        if (triedOnText)    triedOnText.innerText        = '';
      }
    });
  }

  function updatePaginationUI() {
    if (!window.Wized || !Wized.data || !Wized.data.v) return;
    var page  = Wized.data.v.current_page || 1;
    var total = Wized.data.v.total_pages  || 1;
    var indicator = document.querySelector('[wized="page-indicator"]');
    if (indicator) indicator.innerText = 'Page ' + page + ' of ' + total;
    var prevBtn = document.querySelector('[wized="prev-page-btn"]');
    var nextBtn = document.querySelector('[wized="next-page-btn"]');
    if (prevBtn) {
      prevBtn.style.opacity       = page > 1     ? '1'    : '0.4';
      prevBtn.style.pointerEvents = page > 1     ? 'auto' : 'none';
    }
    if (nextBtn) {
      nextBtn.style.opacity       = page < total ? '1'    : '0.4';
      nextBtn.style.pointerEvents = page < total ? 'auto' : 'none';
    }
  }

  function setRecipeResults(recipes) {
    if (!window.Wized || !Wized.data || !Wized.data.v) return;
    _filterCardResults = recipes;
    var totalPages = Math.ceil(recipes.length / _recipesPerPage);
    Wized.data.v.total_pages    = totalPages || 1;
    Wized.data.v.current_page   = 1;
    Wized.data.v.recipe_results = recipes.slice(0, _recipesPerPage);
    Wized.data.v.no_results     = false;
    updatePaginationUI();
    if (_activeFilter === 'notes') {
      setTimeout(function() { applyNotesCardUI(true); }, 300);
    }
  }

  document.addEventListener('click', function(e) {
    if (!_activeFilter) return;
    var prev = e.target.closest('[wized="prev-page-btn"]');
    var next = e.target.closest('[wized="next-page-btn"]');
    if (!prev && !next) return;
    if (!window.Wized || !Wized.data || !Wized.data.v) return;
    var currentPage = Wized.data.v.current_page || 1;
    if (prev && currentPage > 1) {
      Wized.data.v.current_page = currentPage - 1;
    } else if (next && currentPage < Wized.data.v.total_pages) {
      Wized.data.v.current_page = currentPage + 1;
    }
    var start = (Wized.data.v.current_page - 1) * _recipesPerPage;
    Wized.data.v.recipe_results = _filterCardResults.slice(start, start + _recipesPerPage);
    updatePaginationUI();
    if (_activeFilter === 'notes') {
      setTimeout(function() { applyNotesCardUI(true); }, 300);
    }
    var recipeSection = document.querySelector('.recipe-list_section') || document.querySelector('[wized="recipes-grid"]');
    if (recipeSection) {
      recipeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  async function handleFavorites() {
    var base = getBaseFromUrl();
    if (!base) return;
    try {
      var { data: favs, error: favErr } = await _supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', _session.user.id);
      if (favErr || !favs || favs.length === 0) {
        setEmptyStates(false, true);
        setRecipeResults([]);
        return;
      }
      var recipeIds = favs.map(function(f) { return f.recipe_id; });
      var { data: recipes, error: recErr } = await _supabase
        .from('recipes')
        .select('*')
        .in('id', recipeIds)
        .ilike('base_pairing', base);
      if (recErr || !recipes || recipes.length === 0) {
        setEmptyStates(false, true);
        setRecipeResults([]);
        return;
      }
      setEmptyStates(false, false);
      setRecipeResults(recipes);
    } catch(e) {
      setEmptyStates(false, true);
      setRecipeResults([]);
    }
  }

  async function handleRecipes() {
    var base = getBaseFromUrl();
    if (!base) return;
    try {
      var { data: recipes, error } = await _supabase
        .from('recipes')
        .select('*')
        .eq('user_id', _session.user.id)
        .ilike('base_pairing', base);
      if (error || !recipes || recipes.length === 0) {
        setEmptyStates(false, true);
        setRecipeResults([]);
        return;
      }
      setEmptyStates(false, false);
      setRecipeResults(recipes);
    } catch(e) {
      setEmptyStates(false, true);
      setRecipeResults([]);
    }
  }

  async function handleNotes() {
    var base = getBaseFromUrl();
    if (!base) return;
    _triedOnMap = {};
    try {
      var { data: pinnedRecipes, error: pinnedErr } = await _supabase
        .from('recipes')
        .select('id, note_tried, base_pairing')
        .eq('user_id', _session.user.id)
        .not('note_tried', 'is', null)
        .ilike('base_pairing', base);

      var { data: memberNotes, error: memberErr } = await _supabase
        .from('notes')
        .select('recipe_id, tried_it_on')
        .eq('user_id', _session.user.id);

      if (pinnedErr && memberErr) {
        setEmptyStates(false, true);
        setRecipeResults([]);
        return;
      }

      var pinnedRecipeIds = (pinnedRecipes || []).map(function(r) { return r.id; });
      var memberRecipeIds = (memberNotes   || []).map(function(n) { return n.recipe_id; });

      (pinnedRecipes || []).forEach(function(r) {
        _triedOnMap[r.id] = r.note_tried || '';
      });

      (memberNotes || []).forEach(function(n) {
        if (_triedOnMap[n.recipe_id]) {
          if (n.tried_it_on) {
            _triedOnMap[n.recipe_id] += '; ' + n.tried_it_on;
          }
        } else {
          _triedOnMap[n.recipe_id] = n.tried_it_on || '';
        }
      });

      var allRecipeIds = pinnedRecipeIds.concat(
        memberRecipeIds.filter(function(id) {
          return pinnedRecipeIds.indexOf(id) === -1;
        })
      );

      if (allRecipeIds.length === 0) {
        setEmptyStates(false, true);
        setRecipeResults([]);
        return;
      }

      var { data: recipes, error: recErr } = await _supabase
        .from('recipes')
        .select('*')
        .in('id', allRecipeIds)
        .ilike('base_pairing', base);

      if (recErr || !recipes || recipes.length === 0) {
        setEmptyStates(false, true);
        setRecipeResults([]);
        return;
      }

      setEmptyStates(false, false);
      setRecipeResults(recipes);
    } catch(e) {
      setEmptyStates(false, true);
      setRecipeResults([]);
    }
  }

  async function runActiveFilter() {
    if (!_activeFilter) return;
    if (_activeFilter === 'favorites') await handleFavorites();
    if (_activeFilter === 'recipes')   await handleRecipes();
    if (_activeFilter === 'notes')     await handleNotes();
  }

  async function init() {
    try {
      _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      var { data } = await _supabase.auth.getSession();
      _session = data?.session || null;
    } catch(e) {
      _session = null;
    }
    hideAllFilterCardStates();
  }

  document.addEventListener('change', async function(e) {
    var wrapper = e.target.closest('[data-filter-card]');
    if (!wrapper) return;

    var filterType = wrapper.getAttribute('data-filter-card');
    _activeFilter  = filterType;

    window._filterCardAddRecipeOpen = false;

    if (filterType !== 'notes') {
      applyNotesCardUI(false);
      _triedOnMap = {};
    }

    if (window._resetFilterBar) window._resetFilterBar();
    if (window._lockFilterBar)  window._lockFilterBar();

    window._filterCardActive  = true;
    window._filterCardSession = _session;

    if (!_session) {
      setEmptyStates(true, false);
      if (window.Wized && Wized.data && Wized.data.v) {
        Wized.data.v.no_results     = false;
        Wized.data.v.recipe_results = [];
        Wized.data.v.total_pages    = 1;
        Wized.data.v.current_page   = 1;
      }
      _filterCardResults = [];
      updatePaginationUI();
      document.querySelectorAll('.recipe-card').forEach(function(card) {
        card.style.display = 'none';
      });
      return;
    }

    setEmptyStates(false, false);
    await runActiveFilter();
  });

  var _noResultsProxy = null;
  function watchNoResults() {
    if (!window.Wized || !Wized.data || !Wized.data.v) return;
    if (_noResultsProxy) return;
    _noResultsProxy = setInterval(function() {
      if (_activeFilter) {
        var emptyEl     = document.querySelector('[wized="filter-card-empty"]');
        var loggedOutEl = document.querySelector('[wized="filter-card-logged-out"]');
        var emptyShowing     = emptyEl     && emptyEl.style.display     !== 'none';
        var loggedOutShowing = loggedOutEl && loggedOutEl.style.display !== 'none';

        if (loggedOutShowing || emptyShowing) {
          if (window.Wized && Wized.data && Wized.data.v && Wized.data.v.no_results === true) {
            Wized.data.v.no_results = false;
          }
          document.querySelectorAll('.recipe-card').forEach(function(card) {
            if (card.style.display !== 'none') {
              card.style.display = 'none';
            }
          });
          if (!window._filterCardAddRecipeOpen) {
            var addRecipeCard = document.querySelector('[wized="add-recipe-card"]');
            if (addRecipeCard && addRecipeCard.style.display !== 'none') {
              addRecipeCard.style.display = 'none';
            }
          }
        }

        if (loggedOutShowing) {
          if (loggedOutEl && loggedOutEl.style.display === 'none') {
            loggedOutEl.style.display = 'flex';
          }
        }

        if (_activeFilter === 'notes' && !emptyShowing && !loggedOutShowing) {
          applyNotesCardUI(true);
        }
      }
    }, 16);
  }

  window.addEventListener('load', async function() {
    await init();
    watchNoResults();
  });
})();

// ============================================
// RECIPE CARD FAVORITES (filter recipes page)
// ============================================
(function() {
  var SUPABASE_URL = 'https://houohobadselkswaxwsy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW9ob2JhZHNlbGtzd2F4d3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM0NTIsImV4cCI6MjA4OTY4OTQ1Mn0.hOBki3aRyTqOFy3CJZmrNBBULDoRxb9xRjz8iDUEMjo';

  var _supabase     = null;
  var _session      = null;
  var _favoritedIds = new Set();
  var _toastTimeout = null;

  function showToast(message) {
    var existing = document.getElementById('fc-toast');
    if (existing) existing.remove();
    if (_toastTimeout) clearTimeout(_toastTimeout);

    var toast = document.createElement('div');
    toast.id = 'fc-toast';
    toast.innerText = message;
    toast.style.cssText = [
      'position: fixed',
      'bottom: 24px',
      'left: 50%',
      'transform: translateX(-50%)',
      'background: #2e2a26',
      'color: #f9f5ef',
      'padding: 12px 20px',
      'border-radius: 8px',
      'font-size: 14px',
      'z-index: 99999',
      'opacity: 0',
      'transition: opacity 0.3s ease',
      'pointer-events: none',
      'white-space: nowrap'
    ].join(';');

    document.body.appendChild(toast);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        toast.style.opacity = '1';
      });
    });

    _toastTimeout = setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  function setHeartState(wrapper, isFavorited) {
    var inactive = wrapper.querySelector('[wized="card-heart-inactive"]');
    var active   = wrapper.querySelector('[wized="card-heart-active"]');
    if (inactive) inactive.style.display = isFavorited ? 'none' : '';
    if (active)   active.style.display   = isFavorited ? ''     : 'none';
  }

  function applyAllHeartStates() {
    document.querySelectorAll('[wized="card-favorite-wrapper"]').forEach(function(wrapper) {
      var card     = wrapper.closest('.recipe-card');
      var recipeId = card ? card.getAttribute('data-recipe-id') : null;
      if (!recipeId) return;
      setHeartState(wrapper, _favoritedIds.has(recipeId));
    });
  }

  function applyOwnershipUI() {
    if (!_session) return;
    document.querySelectorAll('[wized="card-favorite-wrapper"]').forEach(function(wrapper) {
      var card     = wrapper.closest('.recipe-card');
      var recipeId = card ? card.getAttribute('data-recipe-id') : null;
      if (!recipeId) return;
      var results = (window.Wized && Wized.data && Wized.data.v && Wized.data.v.recipe_results) || [];
      var recipe  = results.find(function(r) { return r.id === recipeId; });
      if (recipe && recipe.user_id === _session.user.id) {
        wrapper.style.display = 'none';
      } else {
        wrapper.style.display = '';
      }
    });
  }

  async function toggleFavorite(recipeId, wrapper) {
    if (!_session) return;
    var isFavorited = _favoritedIds.has(recipeId);
    if (isFavorited) {
      _favoritedIds.delete(recipeId);
    } else {
      _favoritedIds.add(recipeId);
    }
    setHeartState(wrapper, !isFavorited);
    try {
      if (isFavorited) {
        await _supabase
          .from('favorites')
          .delete()
          .eq('user_id', _session.user.id)
          .eq('recipe_id', recipeId);
      } else {
        await _supabase
          .from('favorites')
          .insert({ user_id: _session.user.id, recipe_id: recipeId });
      }
    } catch(e) {
      if (isFavorited) {
        _favoritedIds.add(recipeId);
      } else {
        _favoritedIds.delete(recipeId);
      }
      setHeartState(wrapper, isFavorited);
      showToast('Something went wrong. Please try again.');
    }
  }

  async function loadFavoritedIds() {
    if (!_session) return;
    try {
      var { data, error } = await _supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', _session.user.id);
      if (!error && data) {
        data.forEach(function(row) { _favoritedIds.add(row.recipe_id); });
      }
    } catch(e) {}
  }

  document.addEventListener('click', function(e) {
    var wrapper = e.target.closest('[wized="card-favorite-wrapper"]');
    if (!wrapper) return;
    if (!_session) {
      showToast('Log in or become a member to save your favorite recipes.');
      return;
    }
    var card     = wrapper.closest('.recipe-card');
    var recipeId = card ? card.getAttribute('data-recipe-id') : null;
    if (!recipeId) return;
    toggleFavorite(recipeId, wrapper);
  });

  var _renderProxy = null;
  function watchRenders() {
    if (_renderProxy) return;
    _renderProxy = setInterval(function() {
      applyOwnershipUI();
      applyAllHeartStates();
    }, 300);
  }

  async function init() {
    try {
      _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      var { data } = await _supabase.auth.getSession();
      _session = data?.session || null;
    } catch(e) {
      _session = null;
    }
    await loadFavoritedIds();
  }

  window.addEventListener('load', async function() {
    await init();
    watchRenders();
  });
})();
