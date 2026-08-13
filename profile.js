window.addEventListener('load', async function() {

  var loadStart = Date.now();

  var loadingEl     = document.querySelector('[wized="profile-loading-section"]');
  var contentEl     = document.querySelector('[wized="profile-content"]');
  var usernameEl    = document.querySelector('[wized="profile-username"]');
  var avatarEl      = document.querySelector('[wized="profile-avatar"]');
  var tierEl        = document.querySelector('[wized="profile-tier-badge"]');
  var errorEl       = document.querySelector('[wized="profile-error"]');
  var modalEl       = document.querySelector('[wized="welcome-modal"]');
  var avatarModalEl = document.querySelector('[wized="avatar-modal"]');

  function hideModal() {
    if (!modalEl) return;
    modalEl.style.setProperty('display', 'none', 'important');
    modalEl.style.visibility = 'hidden';
    modalEl.style.pointerEvents = 'none';
    modalEl.querySelectorAll('*').forEach(function(el) { el.style.pointerEvents = 'none'; });
  }
  function showModal() {
    if (!modalEl) return;
    modalEl.style.setProperty('display', 'flex', 'important');
    modalEl.style.visibility = 'visible';
    modalEl.style.pointerEvents = 'auto';
    modalEl.querySelectorAll('*').forEach(function(el) { el.style.pointerEvents = 'auto'; });
  }
  function hideAvatarModal() {
    if (!avatarModalEl) return;
    avatarModalEl.style.setProperty('display', 'none', 'important');
    avatarModalEl.style.pointerEvents = 'none';
    avatarModalEl.querySelectorAll('*').forEach(function(el) { el.style.pointerEvents = 'none'; });
  }
  function showAvatarModal() {
    if (!avatarModalEl) return;
    avatarModalEl.style.setProperty('display', 'flex', 'important');
    avatarModalEl.style.pointerEvents = 'auto';
    avatarModalEl.querySelectorAll('*').forEach(function(el) { el.style.pointerEvents = 'auto'; });
  }

  if (loadingEl) loadingEl.style.setProperty('display', 'block', 'important');
  if (contentEl) contentEl.style.setProperty('display', 'none', 'important');
  if (errorEl)   errorEl.style.setProperty('display', 'none', 'important');
  hideModal();
  hideAvatarModal();

  function hideLoading() { if (loadingEl) loadingEl.style.setProperty('display', 'none', 'important'); }
  function showContent() { if (contentEl) contentEl.style.setProperty('display', 'block', 'important'); }
  function showError(msg) {
    hideLoading();
    if (contentEl) contentEl.style.setProperty('display', 'none', 'important');
    if (errorEl) { errorEl.textContent = msg; errorEl.style.removeProperty('display'); }
  }
  async function finishLoading() {
    var elapsed = Date.now() - loadStart;
    if (elapsed < 300) await new Promise(r => setTimeout(r, 300 - elapsed));
    hideLoading();
    showContent();
  }

  var avatarMap = {
    'chef-hat':     'https://houohobadselkswaxwsy.supabase.co/storage/v1/object/public/icon-images/chef-hat.webp',
    'chef-woman-1': 'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a28732a6c67ccab18efbe8c_woman-1-avatar-compressed.webp',
    'chef-woman-2': 'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a287477e44bac50e643bc8d_woman-2-avatar-compressed.webp',
    'chef-woman-3': 'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a2874b9ec475595038bea7a_woman-3-avatar-compressed.webp',
    'chef-woman-4': 'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a2875a0178b355c59a74cd5_woman-4-avatar-compressed.webp',
    'chef-woman-5': 'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a2875fc1ceb1ed82b458bb5_woman-5-avatar-compressed.webp',
    'chef-man-1':   'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a287638af703fa5f61fc56e_man-1-avatar-compressed.webp',
    'chef-man-2':   'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a2876e47a486e07833e56bd_man-2-avatar-compressed.webp',
    'chef-man-3':   'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a28786a835d8710f8548f5a_man-3-avatar-compressed.webp',
    'chef-man-4':   'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a28789eb76a3546ed5017c0_man-4-avatar-compressed.webp',
    'chef-man-5':   'https://cdn.prod.website-files.com/6895190987f813f35747a739/6a2878eb65f7a9a67edb88c2_man-5-avatar-compressed.webp'
  };

  var selectableAvatars = [
    'chef-woman-1','chef-woman-2','chef-woman-3','chef-woman-4','chef-woman-5',
    'chef-man-1','chef-man-2','chef-man-3','chef-man-4','chef-man-5'
  ];

  var _supabase = supabase.createClient(
    'https://houohobadselkswaxwsy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW9ob2JhZHNlbGtzd2F4d3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM0NTIsImV4cCI6MjA4OTY4OTQ1Mn0.hOBki3aRyTqOFy3CJZmrNBBULDoRxb9xRjz8iDUEMjo'
  );

  var _editMode            = false;
  var _selectedAvatar      = null;
  var _selectedRecipeIds   = {};
  var _selectedFavoriteIds = {};
  var _drawersByRecipeId   = {};

  var SOCIAL_URL_MAP = {
    instagram: function(h) { return 'https://instagram.com/' + h; },
    tiktok:    function(h) { return 'https://tiktok.com/@' + h; },
    youtube:   function(h) { return 'https://youtube.com/@' + h; },
    pinterest: function(h) { return 'https://pinterest.com/' + h; },
  };
  var SOCIAL_MAX_LENGTH = { instagram: 30, tiktok: 24, youtube: 30, pinterest: 30 };

  function cleanHandle(val) { return (val || '').trim().replace(/^@+/, ''); }
  function isValidHandle(val) {
    if (!val) return true;
    return !/[<>\s/\\@]/.test(val) && !/http/i.test(val);
  }
  function toTitleCase(val) {
    if (!val) return '';
    return val.split(' ').map(function(w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }
  function formatFlavor(val) {
    if (!val) return '';
    var arr = Array.isArray(val) ? val : val.split(',');
    return arr.map(function(s) {
      s = s.trim();
      return s.charAt(0).toUpperCase() + s.slice(1);
    }).join(', ');
  }
  function setEditBtnText(text) {
    var btn = document.querySelector('[wized="about_edit_btn"]');
    if (!btn) return;
    var el = btn.querySelector('div, span, p') || btn;
    el.textContent = text;
  }
  function renderSocialLinks(profile) {
    var anyHandle = false;
    ['instagram','tiktok','youtube','pinterest'].forEach(function(key) {
      var wrapper = document.querySelector('[wized="social_' + key + '_link"]');
      if (!wrapper) return;
      var handle = profile['social_' + key];
      if (handle) {
        anyHandle = true;
        wrapper.setAttribute('href', SOCIAL_URL_MAP[key](handle));
        wrapper.setAttribute('target', '_blank');
        wrapper.setAttribute('rel', 'noopener noreferrer');
        wrapper.style.removeProperty('display');
      } else {
        wrapper.style.display = 'none';
      }
    });
    var sw = document.querySelector('[wized="about_socials_wrapper"]');
    var sp = document.querySelector('[wized="about_socials_prompt"]');
    if (anyHandle) {
      if (sw) sw.style.removeProperty('display');
      if (sp) sp.style.setProperty('display', 'none', 'important');
    } else {
      if (sw) sw.style.display = 'none';
      if (sp) sp.style.setProperty('display', 'block', 'important');
    }
  }
  function populateAboutDisplay(profile) {
    [
      { wrapper: 'about_bio_wrapper',      display: 'about_bio_display',      prompt: 'about_bio_prompt',      value: profile.bio           },
      { wrapper: 'about_country_wrapper',  display: 'about_country_display',  prompt: 'about_country_prompt',  value: profile.country       },
      { wrapper: 'about_fav_food_wrapper', display: 'about_fav_food_display', prompt: 'about_fav_food_prompt', value: profile.favorite_food },
    ].forEach(function(f) {
      var w = document.querySelector('[wized="' + f.wrapper + '"]');
      var d = document.querySelector('[wized="' + f.display + '"]');
      var p = document.querySelector('[wized="' + f.prompt  + '"]');
      if (f.value) {
        if (d) d.textContent = f.value;
        if (w) w.style.removeProperty('display');
        if (p) p.style.setProperty('display', 'none', 'important');
      } else {
        if (d) d.textContent = '';
        if (w) w.style.display = 'none';
        if (p) p.style.setProperty('display', 'block', 'important');
      }
    });
  }
  function populateAboutInputs(profile) {
    var b = document.querySelector('[wized="about_bio_input"]');
    var f = document.querySelector('[wized="about_fav_food_input"]');
    var c = document.querySelector('[wized="about_country_input"]');
    if (b) b.value = profile.bio           || '';
    if (f) f.value = profile.favorite_food || '';
    if (c) c.value = profile.country       || '';
    ['instagram','tiktok','youtube','pinterest'].forEach(function(key) {
      var el = document.querySelector('[wized="about_' + key + '_input"]');
      if (el) el.value = profile['social_' + key] || '';
    });
    updateBioCounter();
  }
  function updateBioCounter() {
    var i = document.querySelector('[wized="about_bio_input"]');
    var c = document.querySelector('[wized="bio_char_counter"]');
    if (i && c) c.textContent = i.value.length + ' / 300';
  }
  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  function showAboutView() {
    _editMode = false;
    var v = document.querySelector('[wized="about_view_section"]');
    var e = document.querySelector('[wized="about_edit_section"]');
    if (v) { v.style.removeProperty('display'); v.style.visibility = 'visible'; }
    if (e) e.style.display = 'none';
    setEditBtnText('edit');
    clearAboutMessages();
  }
  function showAboutEdit() {
    _editMode = true;
    var v = document.querySelector('[wized="about_view_section"]');
    var e = document.querySelector('[wized="about_edit_section"]');
    if (v) v.style.display = 'none';
    if (e) { e.style.removeProperty('display'); e.style.visibility = 'visible'; }
    setEditBtnText('cancel');
  }
  function clearAboutMessages() {
    var e = document.querySelector('[wized="about_save_error"]');
    var o = document.querySelector('[wized="about_save_success"]');
    if (e) e.style.setProperty('display', 'none', 'important');
    if (o) o.style.setProperty('display', 'none', 'important');
  }
  function showAboutError(msg) {
    var e = document.querySelector('[wized="about_save_error"]');
    if (e) { e.textContent = msg; e.style.setProperty('display', 'block', 'important'); }
  }
  function showAboutSuccess(msg) {
    var o = document.querySelector('[wized="about_save_success"]');
    if (o) {
      o.textContent = msg;
      o.style.setProperty('display', 'block', 'important');
      setTimeout(function() { o.style.setProperty('display', 'none', 'important'); }, 3000);
    }
  }
  function handleSaveError(err) {
    var msg = (err && err.message) ? err.message : '';
    if (msg.includes('bio'))                showAboutError('Your bio contains prohibited content. Please revise it.');
    else if (msg.includes('favorite_food')) showAboutError('Your favourite food contains prohibited content. Please revise it.');
    else if (msg.includes('country'))       showAboutError('Your country contains prohibited content. Please revise it.');
    else if (msg.includes('social_'))       showAboutError('One of your social handles contains prohibited content. Please revise it.');
    else                                    showAboutError('Could not save. Please check your input and try again.');
  }
  function collectAndValidateSocials() {
    var result = {}, error = null;
    ['instagram','tiktok','youtube','pinterest'].forEach(function(key) {
      if (error) return;
      var el = document.querySelector('[wized="about_' + key + '_input"]');
      var handle = cleanHandle(el ? el.value : '');
      var label = key.charAt(0).toUpperCase() + key.slice(1);
      if (!isValidHandle(handle)) error = label + ' handle looks incorrect — just enter your username, not a URL.';
      else if (handle && handle.length > SOCIAL_MAX_LENGTH[key]) error = label + ' handles can be up to ' + SOCIAL_MAX_LENGTH[key] + ' characters.';
      result[key] = handle || null;
    });
    return { values: result, error: error };
  }

  function initAvatarModal(profile, userId) {
    var editBtn   = document.querySelector('[wized="avatar-edit-btn"]');
    var chooseBtn = document.querySelector('[wized="avatar-modal-choose"]');
    var errEl     = document.querySelector('[wized="avatar-modal-error"]');
    _selectedAvatar = profile.avatar_selection;
    function updateAvatarHighlight(key) {
      selectableAvatars.forEach(function(k) {
        var parts = k.replace('chef-', '').split('-');
        var attr = 'avatar-option-' + parts[0] + '-' + parts[1];
        var el = document.querySelector('[wized="' + attr + '"]');
        if (el) {
          if (k === key) el.classList.add('is-selected');
          else el.classList.remove('is-selected');
        }
      });
    }
    selectableAvatars.forEach(function(k) {
      var parts = k.replace('chef-', '').split('-');
      var attr = 'avatar-option-' + parts[0] + '-' + parts[1];
      var el = document.querySelector('[wized="' + attr + '"]');
      if (el) {
        el.addEventListener('click', function() {
          _selectedAvatar = k;
          updateAvatarHighlight(k);
        });
      }
    });
    if (editBtn) {
      editBtn.addEventListener('click', function() {
        if (errEl) errEl.style.setProperty('display', 'none', 'important');
        _selectedAvatar = profile.avatar_selection;
        updateAvatarHighlight(_selectedAvatar);
        showAvatarModal();
      });
    }
    if (chooseBtn) {
      chooseBtn.addEventListener('click', async function() {
        if (errEl) errEl.style.setProperty('display', 'none', 'important');
        chooseBtn.style.opacity = '0.5';
        chooseBtn.style.pointerEvents = 'none';
        try {
          var { error } = await _supabase.from('profiles').update({ avatar_selection: _selectedAvatar }).eq('id', userId);
          if (error) {
            if (errEl) { errEl.textContent = 'Could not save avatar. Please try again.'; errEl.style.setProperty('display', 'block', 'important'); }
          } else {
            profile.avatar_selection = _selectedAvatar;
            if (window._sauceProfile) window._sauceProfile.avatar_selection = _selectedAvatar;
            var url = avatarMap[_selectedAvatar];
            if (avatarEl && url) { avatarEl.src = url; avatarEl.alt = _selectedAvatar; }
            hideAvatarModal();
          }
        } catch(err) {
          if (errEl) { errEl.textContent = 'Something went wrong. Please try again.'; errEl.style.setProperty('display', 'block', 'important'); }
        } finally {
          chooseBtn.style.opacity = '';
          chooseBtn.style.pointerEvents = '';
        }
      });
    }
    if (avatarModalEl) {
      avatarModalEl.addEventListener('click', function(e) {
        if (e.target === avatarModalEl) hideAvatarModal();
      });
    }
  }

  function initWelcomeModal(userId) {
    var checkbox = document.querySelector('[wized="welcome-guidelines-checkbox"]');
    var enterBtn = document.querySelector('[wized="welcome-enter-btn"]');
    if (!modalEl) return;
    if (window._sauceProfile && window._sauceProfile.community_guidelines_agreed_at) return;
    showModal();
    window.history.replaceState({}, '', window.location.pathname);
    if (enterBtn) { enterBtn.style.opacity = '0.4'; enterBtn.style.pointerEvents = 'none'; }
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        if (enterBtn) {
          enterBtn.style.opacity = checkbox.checked ? '1' : '0.4';
          enterBtn.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
        }
      });
    }
    if (enterBtn) {
      enterBtn.addEventListener('click', async function() {
        if (!checkbox || !checkbox.checked) return;
        enterBtn.style.opacity = '0.5';
        enterBtn.style.pointerEvents = 'none';
        var now = new Date().toISOString();
        var { error } = await _supabase.from('profiles').update({ community_guidelines_agreed_at: now }).eq('id', userId);
        if (window._sauceProfile && !error) { window._sauceProfile.community_guidelines_agreed_at = now; }
        hideModal();
      });
    }
  }

  function initAboutSection(profile, userId) {
    populateAboutDisplay(profile);
    renderSocialLinks(profile);
    populateAboutInputs(profile);
    showAboutView();
    var bioInput = document.querySelector('[wized="about_bio_input"]');
    if (bioInput) bioInput.addEventListener('input', updateBioCounter);
    var editBtn = document.querySelector('[wized="about_edit_btn"]');
    if (editBtn) {
      editBtn.addEventListener('click', function() {
        if (_editMode) { showAboutView(); }
        else { populateAboutInputs(window._sauceProfile || {}); showAboutEdit(); }
      });
    }
    var saveBtn = document.querySelector('[wized="about_save_btn"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', async function() {
        clearAboutMessages();
        var bio     = (document.querySelector('[wized="about_bio_input"]')?.value     || '').trim();
        var favFood = (document.querySelector('[wized="about_fav_food_input"]')?.value || '').trim();
        var country = (document.querySelector('[wized="about_country_input"]')?.value  || '').trim();
        if (bio.length > 300)    { showAboutError('Bio must be 300 characters or fewer.'); return; }
        if (favFood.length > 60) { showAboutError('Favourite food must be 60 characters or fewer.'); return; }
        if (country.length > 60) { showAboutError('Country must be 60 characters or fewer.'); return; }
        var socials = collectAndValidateSocials();
        if (socials.error) { showAboutError(socials.error); return; }
        saveBtn.style.opacity = '0.5';
        saveBtn.style.pointerEvents = 'none';
        try {
          var updatePayload = {
            bio: bio || null, favorite_food: favFood || null, country: country || null,
            social_instagram: socials.values.instagram, social_tiktok: socials.values.tiktok,
            social_youtube: socials.values.youtube, social_pinterest: socials.values.pinterest,
          };
          var { data: updated, error: updateError } = await _supabase.from('profiles').update(updatePayload).eq('id', userId).select().single();
          if (updateError) { handleSaveError(updateError); }
          else {
            if (window._sauceProfile) Object.assign(window._sauceProfile, updatePayload);
            populateAboutDisplay(window._sauceProfile || {});
            renderSocialLinks(window._sauceProfile || {});
            showAboutView();
            showAboutSuccess('Profile updated!');
          }
        } catch(err) { showAboutError('Something went wrong. Please try again.'); }
        finally { saveBtn.style.opacity = ''; saveBtn.style.pointerEvents = ''; }
      });
    }
  }

  function initPanelTabs() {
    var tabs = [
      { tab: 'panel-tab-about',   content: 'panel-content-about'   },
      { tab: 'panel-tab-recipes', content: 'panel-content-recipes' },
      { tab: 'panel-tab-stats',   content: 'panel-content-stats'   },
      { tab: 'panel-tab-quizzes', content: 'panel-content-quizzes' },
    ];
    function showTab(activeContentAttr) {
      tabs.forEach(function(t) {
        var el    = document.querySelector('[wized="' + t.content + '"]');
        var tabEl = document.querySelector('[wized="' + t.tab + '"]');
        var customCheck = tabEl ? tabEl.previousElementSibling : null;
        if (el) {
          el.style.setProperty('display', t.content === activeContentAttr ? 'block' : 'none', 'important');
        }
        if (customCheck && customCheck.classList.contains('w-radio-input')) {
          if (t.content === activeContentAttr) customCheck.classList.add('w--redirected-checked');
          else customCheck.classList.remove('w--redirected-checked');
        }
      });
    }
    showTab('panel-content-about');
    var aboutTab = document.querySelector('[wized="panel-tab-about"]');
    if (aboutTab) {
      aboutTab.checked = true;
      var customCheck = aboutTab.previousElementSibling;
      if (customCheck && customCheck.classList.contains('w-radio-input')) {
        customCheck.classList.add('w--redirected-checked');
      }
    }
    document.addEventListener('click', function(e) {
      tabs.forEach(function(t) {
        var tabEl = document.querySelector('[wized="' + t.tab + '"]');
        if (tabEl && (e.target === tabEl || e.target === tabEl.previousElementSibling)) {
          showTab(t.content);
        }
      });
    });
  }

  function initBulkActions(userId) {
    var toggleBtn   = document.querySelector('[wized="bulk-action-toggle"]');
    var bulkContent = document.querySelector('[wized="bulk-action-content"]');
    var applyBtn    = document.querySelector('[wized="bulk-action-apply"]');
    var deleteRadio = document.querySelector('[wized="bulk-action-delete"]');
    var favRadio    = document.querySelector('[wized="bulk-action-favorites"]');
    var schedRadio  = document.querySelector('[wized="bulk-action-schedule"]');
    var collRadio   = document.querySelector('[wized="bulk-action-collection"]');
    var _bulkOpen = false;
    function openBulkPanel() {
      if (!bulkContent || _bulkOpen) return;
      _bulkOpen = true;
      bulkContent.style.setProperty('display', 'flex', 'important');
      if (toggleBtn) toggleBtn.style.transform = 'rotate(180deg)';
    }
    function closeBulkPanel() {
      if (!bulkContent || !_bulkOpen) return;
      _bulkOpen = false;
      bulkContent.style.setProperty('display', 'none', 'important');
      if (toggleBtn) toggleBtn.style.transform = '';
    }
    function hasAnyChecked() {
      return Object.values(_selectedRecipeIds).some(function(v) { return v === true; });
    }
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        if (_bulkOpen) closeBulkPanel();
        else openBulkPanel();
      });
    }
    if (bulkContent) bulkContent.style.setProperty('display', 'none', 'important');
    window._bulkActions = {
      openBulkPanel: openBulkPanel,
      closeBulkPanel: closeBulkPanel,
      hasAnyChecked: hasAnyChecked
    };
    if (!applyBtn) return;
    applyBtn.addEventListener('click', async function() {
      var selectedIds = Object.keys(_selectedRecipeIds).filter(function(id) {
        return _selectedRecipeIds[id] === true;
      });
      if (selectedIds.length === 0) { alert('Please select at least one recipe.'); return; }
      var isDelete     = deleteRadio && deleteRadio.checked;
      var isFavorites  = favRadio    && favRadio.checked;
      var isSchedule   = schedRadio  && schedRadio.checked;
      var isCollection = collRadio   && collRadio.checked;
      if (!isDelete && !isFavorites && !isSchedule && !isCollection) { alert('Please select an action.'); return; }
      if (isFavorites || isSchedule || isCollection) { alert('This feature is coming soon.'); return; }
      if (isDelete) {
        var confirmed = confirm(
          'Are you sure you want to delete ' + selectedIds.length +
          ' recipe' + (selectedIds.length > 1 ? 's' : '') + '? This cannot be undone.'
        );
        if (!confirmed) return;
        applyBtn.style.opacity = '0.5';
        applyBtn.style.pointerEvents = 'none';
        try {
          var { error: deleteError } = await _supabase
            .from('recipes')
            .delete()
            .in('id', selectedIds)
            .eq('user_id', userId);
          if (deleteError) {
            alert('Could not delete recipes. Please try again.');
          } else {
            selectedIds.forEach(function(id) {
              var wrapper = document.querySelector('[data-recipe-id="' + id + '"]');
              if (wrapper) wrapper.remove();
            });
            _selectedRecipeIds = {};
            var listEl = document.querySelector('[wized="recipes-list"]');
            var remaining = listEl ? listEl.querySelectorAll('[wized="recipe-card-wrapper"]') : [];
            if (remaining.length === 0) {
              var emptyEl = document.querySelector('[wized="recipes-empty-uploads"]');
              if (emptyEl) emptyEl.style.setProperty('display', 'block', 'important');
            }
            if (deleteRadio) deleteRadio.checked = false;
            closeBulkPanel();
          }
        } catch(err) {
          alert('Something went wrong. Please try again.');
        } finally {
          applyBtn.style.opacity = '';
          applyBtn.style.pointerEvents = '';
        }
      }
    });
  }

  function initFavoriteBulkActions(userId) {
    var toggleBtn   = document.querySelector('[wized="favorites-bulk-toggle"]');
    var bulkContent = document.querySelector('[wized="favorites-bulk-content"]');
    var applyBtn    = document.querySelector('[wized="favorites-bulk-apply"]');
    var removeRadio = document.querySelector('[wized="favorites-bulk-remove"]');

    if (bulkContent) bulkContent.style.setProperty('display', 'none', 'important');

    var _bulkOpen = false;

    function openBulkPanel() {
      if (!bulkContent || _bulkOpen) return;
      _bulkOpen = true;
      bulkContent.style.setProperty('display', 'flex', 'important');
      if (toggleBtn) toggleBtn.style.transform = 'rotate(180deg)';
    }
    function closeBulkPanel() {
      if (!bulkContent || !_bulkOpen) return;
      _bulkOpen = false;
      bulkContent.style.setProperty('display', 'none', 'important');
      if (toggleBtn) toggleBtn.style.transform = '';
    }
    function hasAnyChecked() {
      return Object.values(_selectedFavoriteIds).some(function(v) { return v === true; });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        if (_bulkOpen) closeBulkPanel();
        else openBulkPanel();
      });
    }

    window._favoriteBulkActions = {
      openBulkPanel:  openBulkPanel,
      closeBulkPanel: closeBulkPanel,
      hasAnyChecked:  hasAnyChecked
    };

    if (!applyBtn) return;

    document.addEventListener('click', function(e) {
      if (!applyBtn.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();

      var selectedIds = Object.keys(_selectedFavoriteIds).filter(function(id) {
        return _selectedFavoriteIds[id] === true;
      });
      if (selectedIds.length === 0) { alert('Please select at least one recipe.'); return; }

      var isRemove = removeRadio && removeRadio.checked;
      if (!isRemove) { alert('Please select an action.'); return; }

      var confirmed = confirm(
        'Remove ' + selectedIds.length +
        ' recipe' + (selectedIds.length > 1 ? 's' : '') + ' from your favorites?'
      );
      if (!confirmed) return;

      applyBtn.style.opacity       = '0.5';
      applyBtn.style.pointerEvents = 'none';

      _supabase
        .from('favorites')
        .delete()
        .in('recipe_id', selectedIds)
        .eq('user_id', userId)
        .then(function(res) {
          if (res.error) {
            alert('Could not remove favorites. Please try again.');
            applyBtn.style.opacity       = '';
            applyBtn.style.pointerEvents = '';
          } else {
            selectedIds.forEach(function(id) {
              var wrapper = document.querySelector('[data-favorite-recipe-id="' + id + '"]');
              if (wrapper) wrapper.remove();
            });
            _selectedFavoriteIds = {};

            var listEl    = document.querySelector('[wized="favorites-list"]');
            var remaining = listEl ? listEl.querySelectorAll('[data-favorite-recipe-id]') : [];
            var bulkActionsEl = document.querySelector('[wized="favorites-bulk-actions"]');

            if (remaining.length === 0) {
              var emptyEl = document.querySelector('[wized="favorites-empty"]');
              if (emptyEl) emptyEl.style.setProperty('display', 'block', 'important');
              if (bulkActionsEl) bulkActionsEl.style.setProperty('display', 'none', 'important');
            }

            if (removeRadio) removeRadio.checked = false;
            closeBulkPanel();
            applyBtn.style.opacity       = '';
            applyBtn.style.pointerEvents = '';
          }
        });
    }, true);
  }

  // ── Shared note population functions ──────────────────────────────────────

  function populatePinnedNote(drawer, recipe) {
    var pinnedTemplate = drawer.querySelector('[wized="recipe-pinned-note-template"]');
    var noteCardList   = drawer.querySelector('[wized="recipe-note-card-list"]');
    if (!pinnedTemplate || !noteCardList) return;

    var card = pinnedTemplate.cloneNode(true);
    card.removeAttribute('wized');
    card.style.removeProperty('display');
    card.setAttribute('data-profile-note-id', 'pinned-' + recipe.id);

    card.querySelectorAll('[wized="pinned-note-item-details"], [wized="pinned-note-item-tried"]').forEach(function(el) {
      el.style.setProperty('display', 'none', 'important');
    });
    var engagementOnClone = card.querySelector('[wized="pinned-note-engagement"]');
    if (engagementOnClone) engagementOnClone.style.setProperty('display', 'none', 'important');

    var blurbEl = card.querySelector('[wized="pinned-note-blurb"]');
    if (blurbEl) blurbEl.textContent = recipe.note_blurb || '';

    var triedEl = card.querySelector('[wized="pinned-note-tried-value"]');
    if (triedEl) triedEl.textContent = recipe.note_tried || '';

    var detailsEl   = card.querySelector('[wized="pinned-note-details-value"]');
    var detailsItem = card.querySelector('[wized="pinned-note-item-details"]');
    if (!recipe.note_details) {
      if (detailsItem) detailsItem.setAttribute('data-note-hidden', 'content');
    } else {
      if (detailsEl) {
        detailsEl.innerHTML = window.DOMPurify
          ? DOMPurify.sanitize(recipe.note_details, {
              ALLOWED_TAGS: ['b', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
              ALLOWED_ATTR: []
            })
          : recipe.note_details;
      }
    }

    var triedItem = card.querySelector('[wized="pinned-note-item-tried"]');
    if (!recipe.note_tried) {
      if (triedItem) triedItem.setAttribute('data-note-hidden', 'content');
    }

    var imgWrapper = card.querySelector('[wized="pinned-note-image-wrapper"]');
    var imgEl      = card.querySelector('[wized="pinned-note-image"]');
    if (recipe.photo_url && imgEl) {
      imgEl.removeAttribute('srcset');
      imgEl.removeAttribute('sizes');
      imgEl.removeAttribute('loading');
      imgEl.setAttribute('src', recipe.photo_url);
      if (imgWrapper) imgWrapper.style.removeProperty('display');
    } else {
      if (imgWrapper) imgWrapper.style.setProperty('display', 'none', 'important');
    }

    var editLink = card.querySelector('[wized="pinned-note-edit-link"]');
    if (editLink) {
      editLink.style.cursor = 'pointer';
      editLink.addEventListener('click', function() {
        window.location.href = 'https://sauce-share-4c2702.webflow.io/edit-note?type=pinned&id=' + recipe.id;
      });
    }

    var chevron    = card.querySelector('[wized="pinned-note-chevron"]');
    var chevronImg = chevron ? chevron.querySelector('img') : null;
    var engagement = card.querySelector('[wized="pinned-note-engagement"]');

    var accordionRows = Array.prototype.slice.call(
      card.querySelectorAll('[wized="pinned-note-item-details"], [wized="pinned-note-item-tried"]')
    ).filter(function(el) {
      return el.getAttribute('data-note-hidden') !== 'content';
    });

    var _expanded = false;

    if (chevron) {
      document.addEventListener('click', function(e) {
        if (!chevron.contains(e.target)) return;
        _expanded = !_expanded;
        accordionRows.forEach(function(el) {
          el.style.setProperty('display', _expanded ? 'flex' : 'none', 'important');
        });
        if (engagement) engagement.style.setProperty('display', _expanded ? 'flex' : 'none', 'important');
        if (chevronImg) {
          chevronImg.style.transition = 'transform 0.3s ease';
          chevronImg.style.transform  = _expanded ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      }, true);
    }

    noteCardList.appendChild(card);
  }

  function populateCommunityNotes(drawer, notes) {
    var noteTemplate = drawer.querySelector('[wized="recipe-community-note-template"]');
    var noteCardList = drawer.querySelector('[wized="recipe-note-card-list"]');
    if (!noteTemplate || !noteCardList) return;

    notes.forEach(function(note) {
      var card = noteTemplate.cloneNode(true);
      card.removeAttribute('wized');
      card.style.removeProperty('display');
      card.setAttribute('data-profile-note-id', 'community-' + note.id);

      card.querySelectorAll('[wized="note-card-item-tried"], [wized="note-card-item-thoughts"]').forEach(function(el) {
        el.style.setProperty('display', 'none', 'important');
      });
      var engagementOnClone = card.querySelector('[wized="note-card-engagement"]');
      if (engagementOnClone) engagementOnClone.style.setProperty('display', 'none', 'important');

      var triedValueEl = card.querySelector('[wized="note-card-tried-value"]');
      if (triedValueEl) triedValueEl.textContent = note.tried_it_on || '';

      var thoughtsEl   = card.querySelector('[wized="note-card-thoughts-value"]');
      var thoughtsItem = card.querySelector('[wized="note-card-item-thoughts"]');
      if (!note.sauce_thoughts) {
        if (thoughtsItem) thoughtsItem.setAttribute('data-note-hidden', 'content');
      } else {
        if (thoughtsEl) thoughtsEl.textContent = note.sauce_thoughts;
      }

      var detailsEl   = card.querySelector('[wized="note-card-details-value"]');
      var detailsItem = card.querySelector('[wized="note-card-item-tried"]');
      if (!note.meal_details) {
        if (detailsItem) detailsItem.setAttribute('data-note-hidden', 'content');
      } else {
        if (detailsEl) {
          detailsEl.innerHTML = window.DOMPurify
            ? DOMPurify.sanitize(note.meal_details, {
                ALLOWED_TAGS: ['b', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
                ALLOWED_ATTR: []
              })
            : note.meal_details;
        }
      }

      var imgWrapper = card.querySelector('[wized="note-card-image-wrapper"]');
      var imgEl      = card.querySelector('[wized="note-card-image"]');
      if (note.photo_url && imgEl) {
        imgEl.removeAttribute('srcset');
        imgEl.removeAttribute('sizes');
        imgEl.removeAttribute('loading');
        imgEl.setAttribute('src', note.photo_url);
        if (imgWrapper) imgWrapper.style.removeProperty('display');
      } else {
        if (imgWrapper) imgWrapper.style.setProperty('display', 'none', 'important');
      }

      var editLink = card.querySelector('[wized="note-card-edit-link"]');
      if (editLink) {
        editLink.style.cursor = 'pointer';
        editLink.addEventListener('click', function() {
          window.location.href = 'https://sauce-share-4c2702.webflow.io/edit-note?type=community&id=' + note.id;
        });
      }

      var chevron    = card.querySelector('[wized="note-card-chevron"]');
      var chevronImg = chevron ? chevron.querySelector('img') : null;
      var engagement = card.querySelector('[wized="note-card-engagement"]');

      var accordionRows = Array.prototype.slice.call(
        card.querySelectorAll('[wized="note-card-item-tried"], [wized="note-card-item-thoughts"]')
      ).filter(function(el) {
        return el.getAttribute('data-note-hidden') !== 'content';
      });

      var _expanded = false;

      if (chevron) {
        document.addEventListener('click', function(e) {
          if (!chevron.contains(e.target)) return;
          _expanded = !_expanded;
          accordionRows.forEach(function(el) {
            el.style.setProperty('display', _expanded ? 'flex' : 'none', 'important');
          });
          if (engagement) engagement.style.setProperty('display', _expanded ? 'flex' : 'none', 'important');
          if (chevronImg) {
            chevronImg.style.transition = 'transform 0.3s ease';
            chevronImg.style.transform  = _expanded ? 'rotate(180deg)' : 'rotate(0deg)';
          }
        }, true);
      }

      noteCardList.appendChild(card);
    });
  }

  // ── Shared row renderer ────────────────────────────────────────────────────

  function renderRows(list, templateAttr, textAttr, items) {
    if (!list || !items || !items.length) return;
    var rowTemplate = list.querySelector('[wized="' + templateAttr + '"]');
    if (!rowTemplate) return;
    list.removeChild(rowTemplate);
    while (list.firstChild) list.removeChild(list.firstChild);
    items.forEach(function(item) {
      var row = rowTemplate.cloneNode(true);
      row.removeAttribute('wized');
      var textEl = row.querySelector('[wized="' + textAttr + '"]');
      if (textEl) textEl.textContent = item;
      row.style.setProperty('display', 'block', 'important');
      list.appendChild(row);
    });
  }

  // ── Load recipes ───────────────────────────────────────────────────────────

  async function loadProfileRecipes(userId) {
    var listEl           = document.querySelector('[wized="recipes-list"]');
    var templateEl       = document.querySelector('[wized="recipe-card-template"]');
    var drawerTemplateEl = document.querySelector('[wized="recipe-glance-drawer-template"]');
    var emptyEl          = document.querySelector('[wized="recipes-empty-uploads"]');
    var seeMoreBtn       = document.querySelector('[wized="recipes-see-more-btn"]');
    var seeLessBtn       = document.querySelector('[wized="recipes-see-less-btn"]');
    if (!listEl || !templateEl) return;

    templateEl.style.setProperty('display', 'none', 'important');
    if (drawerTemplateEl) drawerTemplateEl.style.setProperty('display', 'none', 'important');
    if (emptyEl)          emptyEl.style.setProperty('display', 'none', 'important');
    if (seeMoreBtn)       seeMoreBtn.style.setProperty('display', 'none', 'important');
    if (seeLessBtn)       seeLessBtn.style.setProperty('display', 'none', 'important');

    var ingredientRowTemplate = templateEl.querySelector('[wized="recipe-ingredient-row-template"]');
    var directionRowTemplate  = templateEl.querySelector('[wized="recipe-direction-row-template"]');
    if (ingredientRowTemplate) ingredientRowTemplate.style.setProperty('display', 'none', 'important');
    if (directionRowTemplate)  directionRowTemplate.style.setProperty('display', 'none', 'important');

    var { data: recipes, error } = await _supabase
      .from('recipes')
      .select('id, recipe_title, slug, header_image, base_pairing, flavor_profile, ingredients, directions, note_blurb, note_tried, note_details, photo_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !recipes || recipes.length === 0) {
      if (emptyEl) emptyEl.style.setProperty('display', 'block', 'important');
      return;
    }

    var { data: allCommunityNotes } = await _supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    allCommunityNotes = allCommunityNotes || [];

    var notesByRecipeId = {};
    allCommunityNotes.forEach(function(note) {
      if (!notesByRecipeId[note.recipe_id]) notesByRecipeId[note.recipe_id] = [];
      notesByRecipeId[note.recipe_id].push(note);
    });

    var PAGE_SIZE = 20;
    var currentlyShown = 0;

    function buildCard(recipe, drawer) {
      var card = templateEl.cloneNode(true);
      card.removeAttribute('wized');
      card.style.setProperty('display', 'flex', 'important');

      var thumb     = card.querySelector('[wized="recipe-thumb"]');
      var title     = card.querySelector('[wized="recipe-title"]');
      var base      = card.querySelector('[wized="recipe-base"]');
      var flavor    = card.querySelector('[wized="recipe-flavor"]');
      var glanceBtn = card.querySelector('[wized="recipe-glance-btn"]');
      var checkbox  = card.querySelector('[wized="recipe-checkbox"]');

      var editBtn         = drawer ? drawer.querySelector('[wized="recipe-edit-btn"]')         : null;
      var ingredientsList = drawer ? drawer.querySelector('[wized="recipe-ingredients-list"]') : null;
      var directionsList  = drawer ? drawer.querySelector('[wized="recipe-directions-list"]')  : null;
      var instructions    = drawer ? drawer.querySelector('[wized="recipe-instructions"]')     : null;
      var notesSection    = drawer ? drawer.querySelector('[wized="recipe-notes-section"]')    : null;
      var noteCardList    = drawer ? drawer.querySelector('[wized="recipe-note-card-list"]')   : null;
      var notesToggle     = drawer ? drawer.querySelector('[wized="recipe-notes-toggle"]')     : null;

      if (thumb) {
        thumb.removeAttribute('srcset');
        thumb.removeAttribute('sizes');
        thumb.removeAttribute('loading');
        thumb.setAttribute('src', recipe.header_image || '');
        thumb.alt = recipe.recipe_title || '';
      }
      if (title) {
        title.textContent = recipe.recipe_title || '';
        title.style.cursor = 'pointer';
        title.addEventListener('click', function() {
          window.location.href = 'https://sauce-share-4c2702.webflow.io/recipe?slug=' + (recipe.slug || '');
        });
      }
      if (base)   base.textContent   = toTitleCase(recipe.base_pairing || '');
      if (flavor) flavor.textContent = formatFlavor(recipe.flavor_profile);

      if (checkbox) {
        checkbox.addEventListener('change', function() {
          _selectedRecipeIds[recipe.id] = checkbox.checked;
          if (window._bulkActions) {
            if (checkbox.checked) window._bulkActions.openBulkPanel();
            else if (!window._bulkActions.hasAnyChecked()) window._bulkActions.closeBulkPanel();
          }
        });
      }

      if (editBtn) {
        editBtn.style.cursor = 'pointer';
        editBtn.addEventListener('click', function() {
          window.location.href = 'https://sauce-share-4c2702.webflow.io/edit-recipe?slug=' + (recipe.slug || '');
        });
      }

      if (ingredientsList) renderRows(ingredientsList, 'recipe-ingredient-row-template', 'recipe-ingredient-text', recipe.ingredients);
      if (directionsList)  renderRows(directionsList,  'recipe-direction-row-template',  'recipe-direction-text',  recipe.directions);

      if (instructions) instructions.style.setProperty('display', 'none', 'important');
      if (notesSection) notesSection.style.setProperty('display', 'none', 'important');
      if (noteCardList) noteCardList.style.setProperty('display', 'none', 'important');

      var communityTemplate = drawer ? drawer.querySelector('[wized="recipe-community-note-template"]') : null;
      if (communityTemplate) communityTemplate.style.setProperty('display', 'none', 'important');

      var pinnedTemplate = drawer ? drawer.querySelector('[wized="recipe-pinned-note-template"]') : null;
      if (pinnedTemplate) pinnedTemplate.style.setProperty('display', 'none', 'important');

      if (!!recipe.note_blurb && noteCardList) populatePinnedNote(drawer, recipe);

      var recipeNotes = notesByRecipeId[recipe.id] || [];
      if (recipeNotes.length > 0 && noteCardList) populateCommunityNotes(drawer, recipeNotes);

      if (notesToggle && noteCardList) {
        var _notesOpen = false;
        var notesIcon  = notesToggle.querySelector('img');
        document.addEventListener('click', function(e) {
          if (!notesToggle.contains(e.target)) return;
          _notesOpen = !_notesOpen;
          noteCardList.style.setProperty('display', _notesOpen ? 'flex' : 'none', 'important');
          if (notesIcon) {
            notesIcon.style.transition = 'transform 0.3s ease';
            notesIcon.style.transform  = _notesOpen ? 'rotate(180deg)' : 'rotate(0deg)';
          }
        }, true);
      }

      if (glanceBtn && drawer) {
        var glanceIcon = glanceBtn.querySelector('[wized="recipe-glance-icon"]');
        glanceBtn.addEventListener('click', function() {
          var isOpen = drawer._glanceOpen;
          if (isOpen) {
            drawer._glanceOpen = false;
            drawer.style.setProperty('display', 'none', 'important');
            if (glanceIcon) glanceIcon.style.transform = '';
          } else {
            drawer._glanceOpen = true;
            drawer.style.setProperty('display', 'block', 'important');
            if (instructions) instructions.style.setProperty('display', 'flex', 'important');
            if (notesSection)  notesSection.style.setProperty('display', 'block', 'important');
            if (glanceIcon) glanceIcon.style.transform = 'rotate(180deg)';
          }
        });
      }

      return card;
    }

    function showPage(upTo) {
      var wrappers = listEl.querySelectorAll('[wized="recipe-card-wrapper"]');
      wrappers.forEach(function(w, i) {
        w.style.setProperty('display', i < upTo ? 'block' : 'none', 'important');
      });
    }

    recipes.forEach(function(recipe) {
      var drawer = drawerTemplateEl ? drawerTemplateEl.cloneNode(true) : null;
      if (drawer) {
        drawer.removeAttribute('wized');
        drawer.setAttribute('wized', 'recipe-drawer');
        drawer.style.setProperty('display', 'none', 'important');
        _drawersByRecipeId[recipe.id] = drawer;
      }
      var card = buildCard(recipe, drawer);
      card.setAttribute('wized', 'recipe-card');
      var wrapper = document.createElement('div');
      wrapper.setAttribute('wized', 'recipe-card-wrapper');
      wrapper.setAttribute('data-recipe-id', recipe.id);
      wrapper.style.width = '100%';
      wrapper.appendChild(card);
      if (drawer) wrapper.appendChild(drawer);
      listEl.appendChild(wrapper);
    });

    currentlyShown = Math.min(PAGE_SIZE, recipes.length);
    showPage(currentlyShown);

    if (recipes.length > PAGE_SIZE) {
      if (seeMoreBtn) seeMoreBtn.style.setProperty('display', 'block', 'important');
    }
    if (seeMoreBtn) {
      seeMoreBtn.addEventListener('click', function() {
        currentlyShown = Math.min(currentlyShown + PAGE_SIZE, recipes.length);
        showPage(currentlyShown);
        if (currentlyShown >= recipes.length) seeMoreBtn.style.setProperty('display', 'none', 'important');
        if (seeLessBtn) seeLessBtn.style.setProperty('display', 'block', 'important');
      });
    }
    if (seeLessBtn) {
      seeLessBtn.addEventListener('click', function() {
        currentlyShown = PAGE_SIZE;
        showPage(currentlyShown);
        seeLessBtn.style.setProperty('display', 'none', 'important');
        if (seeMoreBtn && recipes.length > PAGE_SIZE) seeMoreBtn.style.setProperty('display', 'block', 'important');
      });
    }
  }

  // ── Load favorite recipes ──────────────────────────────────────────────────

  async function loadFavoriteRecipes(userId) {
    var listEl              = document.querySelector('[wized="favorites-list"]');
    var templateEl          = document.querySelector('[wized="favorites-card-template"]');
    var drawerTemplateEl    = document.querySelector('[wized="favorites-glance-drawer-template"]');
    var emptyEl             = document.querySelector('[wized="favorites-empty"]');
    var seeMoreBtn          = document.querySelector('[wized="favorites-see-more-btn"]');
    var seeLessBtn          = document.querySelector('[wized="favorites-see-less-btn"]');
    var showButtonsWrapper  = document.querySelector('[wized="favorites-show-buttons-wrapper"]');
    var bulkActionsEl       = document.querySelector('[wized="favorites-bulk-actions"]');

    if (!listEl || !templateEl) return;

    // Hide everything at start
    if (bulkActionsEl)      bulkActionsEl.style.setProperty('display', 'none', 'important');
    if (showButtonsWrapper) showButtonsWrapper.style.setProperty('display', 'none', 'important');
    templateEl.style.setProperty('display', 'none', 'important');
    if (drawerTemplateEl) drawerTemplateEl.style.setProperty('display', 'none', 'important');
    if (emptyEl)          emptyEl.style.setProperty('display', 'none', 'important');
    if (seeMoreBtn)       seeMoreBtn.style.setProperty('display', 'none', 'important');
    if (seeLessBtn)       seeLessBtn.style.setProperty('display', 'none', 'important');

    var { data: favorites, error } = await _supabase
      .from('favorites')
      .select('recipe_id, created_at, recipes(id, recipe_title, slug, header_image, base_pairing, flavor_profile, ingredients, directions, note_blurb, note_tried, note_details, photo_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !favorites || favorites.length === 0) {
      if (emptyEl) emptyEl.style.setProperty('display', 'block', 'important');
      return;
    }

    var recipes = favorites
      .map(function(f) { return f.recipes; })
      .filter(function(r) { return !!r; });

    if (recipes.length === 0) {
      if (emptyEl) emptyEl.style.setProperty('display', 'block', 'important');
      return;
    }

    // Favorites exist — show bulk actions
    if (bulkActionsEl) bulkActionsEl.style.setProperty('display', 'block', 'important');

    var { data: allCommunityNotes } = await _supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    allCommunityNotes = allCommunityNotes || [];

    var notesByRecipeId = {};
    allCommunityNotes.forEach(function(note) {
      if (!notesByRecipeId[note.recipe_id]) notesByRecipeId[note.recipe_id] = [];
      notesByRecipeId[note.recipe_id].push(note);
    });

    var PAGE_SIZE      = 20;
    var currentlyShown = 0;

    function buildFavoriteCard(recipe, drawer) {
      var card = templateEl.cloneNode(true);
      card.removeAttribute('wized');
      card.style.setProperty('display', 'flex', 'important');

      var thumb     = card.querySelector('[wized="recipe-thumb"]');
      var title     = card.querySelector('[wized="recipe-title"]');
      var base      = card.querySelector('[wized="recipe-base"]');
      var flavor    = card.querySelector('[wized="recipe-flavor"]');
      var glanceBtn = card.querySelector('[wized="recipe-glance-btn"]');
      var checkbox  = card.querySelector('[wized="recipe-checkbox"]');
      var editBtn   = drawer ? drawer.querySelector('[wized="recipe-edit-btn"]') : null;

      var ingredientsList = drawer ? drawer.querySelector('[wized="recipe-ingredients-list"]') : null;
      var directionsList  = drawer ? drawer.querySelector('[wized="recipe-directions-list"]')  : null;
      var instructions    = drawer ? drawer.querySelector('[wized="recipe-instructions"]')     : null;
      var notesSection    = drawer ? drawer.querySelector('[wized="recipe-notes-section"]')    : null;
      var noteCardList    = drawer ? drawer.querySelector('[wized="recipe-note-card-list"]')   : null;
      var notesToggle     = drawer ? drawer.querySelector('[wized="recipe-notes-toggle"]')     : null;

      if (thumb) {
        thumb.removeAttribute('srcset');
        thumb.removeAttribute('sizes');
        thumb.removeAttribute('loading');
        thumb.setAttribute('src', recipe.header_image || '');
        thumb.alt = recipe.recipe_title || '';
      }
      if (title) {
        title.textContent = recipe.recipe_title || '';
        title.style.cursor = 'pointer';
        title.addEventListener('click', function() {
          window.location.href = 'https://sauce-share-4c2702.webflow.io/recipe?slug=' + (recipe.slug || '');
        });
      }
      if (base)   base.textContent   = toTitleCase(recipe.base_pairing || '');
      if (flavor) flavor.textContent = formatFlavor(recipe.flavor_profile);

      var favCheckbox = card.querySelector('[wized="favorites-checkbox"]');
      if (favCheckbox) {
        favCheckbox.addEventListener('change', function() {
          _selectedFavoriteIds[recipe.id] = favCheckbox.checked;
          if (window._favoriteBulkActions) {
            if (favCheckbox.checked) window._favoriteBulkActions.openBulkPanel();
            else if (!window._favoriteBulkActions.hasAnyChecked()) window._favoriteBulkActions.closeBulkPanel();
          }
        });
      }

      if (checkbox) checkbox.style.setProperty('display', 'none', 'important');
      if (editBtn)  editBtn.style.setProperty('display', 'none', 'important');

      if (ingredientsList) renderRows(ingredientsList, 'recipe-ingredient-row-template', 'recipe-ingredient-text', recipe.ingredients);
      if (directionsList)  renderRows(directionsList,  'recipe-direction-row-template',  'recipe-direction-text',  recipe.directions);

      if (instructions) instructions.style.setProperty('display', 'none', 'important');
      if (notesSection) notesSection.style.setProperty('display', 'none', 'important');
      if (noteCardList) noteCardList.style.setProperty('display', 'none', 'important');

      var communityTemplate = drawer ? drawer.querySelector('[wized="recipe-community-note-template"]') : null;
      if (communityTemplate) communityTemplate.style.setProperty('display', 'none', 'important');

      var pinnedTemplate = drawer ? drawer.querySelector('[wized="recipe-pinned-note-template"]') : null;
      if (pinnedTemplate) pinnedTemplate.style.setProperty('display', 'none', 'important');

      if (!!recipe.note_blurb && noteCardList) populatePinnedNote(drawer, recipe);

      var recipeNotes = notesByRecipeId[recipe.id] || [];
      if (recipeNotes.length > 0 && noteCardList) populateCommunityNotes(drawer, recipeNotes);

      if (notesToggle && noteCardList) {
        var _notesOpen = false;
        var notesIcon  = notesToggle.querySelector('img');
        document.addEventListener('click', function(e) {
          if (!notesToggle.contains(e.target)) return;
          _notesOpen = !_notesOpen;
          noteCardList.style.setProperty('display', _notesOpen ? 'flex' : 'none', 'important');
          if (notesIcon) {
            notesIcon.style.transition = 'transform 0.3s ease';
            notesIcon.style.transform  = _notesOpen ? 'rotate(180deg)' : 'rotate(0deg)';
          }
        }, true);
      }

      if (glanceBtn && drawer) {
        var glanceIcon = glanceBtn.querySelector('[wized="recipe-glance-icon"]');
        glanceBtn.addEventListener('click', function() {
          var isOpen = drawer._glanceOpen;
          if (isOpen) {
            drawer._glanceOpen = false;
            drawer.style.setProperty('display', 'none', 'important');
            if (glanceIcon) glanceIcon.style.transform = '';
          } else {
            drawer._glanceOpen = true;
            drawer.style.setProperty('display', 'block', 'important');
            if (instructions) instructions.style.setProperty('display', 'flex', 'important');
            if (notesSection)  notesSection.style.setProperty('display', 'flex', 'important');
            if (glanceIcon) glanceIcon.style.transform = 'rotate(180deg)';
          }
        });
      }

      return card;
    }

    function showPage(upTo) {
      var wrappers = listEl.querySelectorAll('[data-favorite-recipe-id]');
      wrappers.forEach(function(w, i) {
        w.style.setProperty('display', i < upTo ? 'block' : 'none', 'important');
      });
    }

    recipes.forEach(function(recipe) {
      var drawer = drawerTemplateEl ? drawerTemplateEl.cloneNode(true) : null;
      if (drawer) {
        drawer.removeAttribute('wized');
        drawer.setAttribute('wized', 'recipe-drawer');
        drawer.style.setProperty('display', 'none', 'important');
      }
      var card = buildFavoriteCard(recipe, drawer);
      card.setAttribute('wized', 'favorites-card');
      var wrapper = document.createElement('div');
      wrapper.setAttribute('data-favorite-recipe-id', recipe.id);
      wrapper.style.width = '100%';
      wrapper.appendChild(card);
      if (drawer) wrapper.appendChild(drawer);
      listEl.appendChild(wrapper);
    });

    currentlyShown = Math.min(PAGE_SIZE, recipes.length);
    showPage(currentlyShown);

    if (recipes.length > PAGE_SIZE) {
      if (showButtonsWrapper) showButtonsWrapper.style.setProperty('display', 'flex', 'important');
      if (seeMoreBtn) seeMoreBtn.style.setProperty('display', 'block', 'important');
    }

    if (seeMoreBtn) {
      seeMoreBtn.addEventListener('click', function() {
        currentlyShown = Math.min(currentlyShown + PAGE_SIZE, recipes.length);
        showPage(currentlyShown);
        if (currentlyShown >= recipes.length) {
          if (seeMoreBtn) seeMoreBtn.style.setProperty('display', 'none', 'important');
          if (showButtonsWrapper && !seeLessBtn) showButtonsWrapper.style.setProperty('display', 'none', 'important');
        }
        if (seeLessBtn) seeLessBtn.style.setProperty('display', 'block', 'important');
      });
    }
    if (seeLessBtn) {
      seeLessBtn.addEventListener('click', function() {
        currentlyShown = PAGE_SIZE;
        showPage(currentlyShown);
        seeLessBtn.style.setProperty('display', 'none', 'important');
        if (recipes.length > PAGE_SIZE) {
          if (seeMoreBtn) seeMoreBtn.style.setProperty('display', 'block', 'important');
          if (showButtonsWrapper) showButtonsWrapper.style.setProperty('display', 'flex', 'important');
        }
      });
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────

  try {
    var { data: sessionData } = await _supabase.auth.getSession();
    var session = sessionData?.session;
    if (!session) { window.location.href = 'https://sauce-share-4c2702.webflow.io/sign-up'; return; }

    var { data: profile, error } = await _supabase
      .from('profiles')
      .select('username, avatar_selection, subscription_tier, bio, favorite_food, country, social_instagram, social_tiktok, social_youtube, social_pinterest, created_at, community_guidelines_agreed_at')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) { showError('Could not load your profile. Please try refreshing.'); return; }

    if (usernameEl) usernameEl.textContent = '@' + profile.username;
    if (tierEl) tierEl.textContent = profile.subscription_tier === 'plus' ? 'Plus' : 'Free';
    if (avatarEl && profile.avatar_selection) {
      var url = avatarMap[profile.avatar_selection];
      if (url) { avatarEl.src = url; avatarEl.alt = profile.avatar_selection; }
    }
    var mEl = document.querySelector('[wized="profile-member-since"]');
    if (mEl) mEl.textContent = formatDate(profile.created_at);

    window._sauceProfile = profile;

    try { initWelcomeModal(session.user.id); } catch (modalErr) {}

    initAboutSection(profile, session.user.id);
    initAvatarModal(profile, session.user.id);
    initPanelTabs();
    initBulkActions(session.user.id);
    initFavoriteBulkActions(session.user.id);
    await finishLoading();
    await loadProfileRecipes(session.user.id);
    await loadFavoriteRecipes(session.user.id);

  } catch (err) {
    showError('Something went wrong loading your profile. Please try refreshing.');
  }

});
