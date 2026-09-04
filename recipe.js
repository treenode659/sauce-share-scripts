document.addEventListener("DOMContentLoaded", function() {
  const progressBarFill = document.querySelector('.progress-bar_fill');
  const progressText    = document.querySelector('.progress-bar_label');

  function setupCheckboxes() {
    const rows = document.querySelectorAll('.recipe-ingredients_item, .recipe-directions_item');
    rows.forEach(row => {
      if (row.querySelector('.recipe-ingredients_checkbox')) return;
      const textElement = row.querySelector('p');
      if (textElement) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('recipe-ingredients_checkbox');
        row.insertBefore(checkbox, textElement);
      }
    });
    updateProgress();
  }

  function updateProgress() {
    const all     = document.querySelectorAll('.recipe-ingredients_checkbox');
    const checked = document.querySelectorAll('.recipe-ingredients_checkbox:checked');
    if (all.length > 0) {
      const percentage = Math.round((checked.length / all.length) * 100);
      if (progressBarFill) progressBarFill.style.width = percentage + '%';

      if (progressText) {
        // First run: turn the label into a flex row with two spans inside —
        // the percentage text (left) and "Write a note" (right).
        var pctSpan = progressText.querySelector('#script-pct-text');
        if (!pctSpan) {
          progressText.innerHTML = '';
          progressText.style.display        = 'flex';
          progressText.style.flexDirection  = 'row';
          progressText.style.flexWrap       = 'nowrap';
          progressText.style.alignItems     = 'center';
          progressText.style.justifyContent = 'space-between';
          progressText.style.width          = '100%';

          pctSpan = document.createElement('span');
          pctSpan.id = 'script-pct-text';
          progressText.appendChild(pctSpan);

          var writeNoteEl = document.createElement('span');
          writeNoteEl.id = 'script-write-note';
          writeNoteEl.textContent = 'Write a note';
          writeNoteEl.style.cssText = 'display:none;cursor:pointer;color:#64794E;text-decoration:underline;white-space:nowrap;';
          writeNoteEl.addEventListener('click', function() {
            var target = document.getElementById('notes-form') || document.querySelector('.member-notes_controls');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          });
          progressText.appendChild(writeNoteEl);
        }

        pctSpan.textContent = percentage + '% Complete';

        var writeNoteToggle = document.getElementById('script-write-note');
        if (writeNoteToggle) {
          writeNoteToggle.style.display = percentage === 100 ? 'inline' : 'none';
        }
      }
    }
  }

  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('recipe-ingredients_checkbox')) {
      const text = e.target.nextElementSibling;
      if (e.target.checked) text.classList.add('is-checked-text');
      else                  text.classList.remove('is-checked-text');
      updateProgress();
    }
  });

  const observer = new MutationObserver(() => { setupCheckboxes(); });
  const listContainers = document.querySelectorAll('.recipe-ingredients_list, .recipe-directions_list');
  listContainers.forEach(container => {
    observer.observe(container, { childList: true, subtree: true });
  });

  setupCheckboxes();
});

document.addEventListener('DOMContentLoaded', function () {

  function getLineHeight(el) {
    var lh = parseFloat(window.getComputedStyle(el).lineHeight);
    return isNaN(lh) ? 24 : lh;
  }

  function checkOverflow(textEl, readMore) {
    if (textEl.clientHeight === 0) return;
    if (textEl.scrollHeight <= textEl.clientHeight + 2) readMore.style.display = 'none';
    else readMore.style.display = '';
  }

  function initReadMore(block) {
    var textEl   = block.querySelector('.note-details_meal-text p');
    if (!textEl) textEl = block.querySelector('.note-details_meal-text');
    var readMore = block.querySelector('.text-read-more');
    var readLess = block.querySelector('.text-read-less');
    if (!textEl || !readMore || !readLess) return;

    if (!block.dataset.readMoreInit) {
      block.dataset.readMoreInit = 'true';

      readMore.addEventListener('click', function () {
        var fullHeight  = textEl.scrollHeight;
        var startHeight = textEl.clientHeight;
        textEl.style.display         = 'block';
        textEl.style.overflow        = 'hidden';
        textEl.style.webkitLineClamp = 'unset';
        textEl.style.height          = startHeight + 'px';
        textEl.style.transition      = 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        requestAnimationFrame(function () { textEl.style.height = fullHeight + 'px'; });
        textEl.addEventListener('transitionend', function onExpand() {
          textEl.style.height   = 'auto';
          textEl.style.overflow = 'visible';
          textEl.removeEventListener('transitionend', onExpand);
        });
        readMore.style.display = 'none';
        readLess.style.display = 'block';
      });

      readLess.addEventListener('click', function () {
        var lh              = getLineHeight(textEl);
        var collapsedHeight = lh * 3;
        var startHeight     = textEl.clientHeight;
        textEl.style.overflow   = 'hidden';
        textEl.style.height     = startHeight + 'px';
        textEl.style.transition = 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { textEl.style.height = collapsedHeight + 'px'; });
        });
        textEl.addEventListener('transitionend', function onCollapse() {
          textEl.style.display         = '-webkit-box';
          textEl.style.webkitLineClamp = '3';
          textEl.style.webkitBoxOrient = 'vertical';
          textEl.style.overflow        = 'hidden';
          textEl.style.height          = '';
          textEl.style.transition      = '';
          textEl.removeEventListener('transitionend', onCollapse);
          setTimeout(function () { checkOverflow(textEl, readMore); }, 50);
        });
        readLess.style.display = 'none';
      });
    }

    textEl.style.transition      = '';
    textEl.style.height          = '';
    textEl.style.display         = '-webkit-box';
    textEl.style.webkitLineClamp = '3';
    textEl.style.webkitBoxOrient = 'vertical';
    textEl.style.overflow        = 'hidden';
    readLess.style.display = 'none';
    readMore.style.display = 'none';

    function tryCheck() {
      if (textEl.clientHeight === 0) { setTimeout(tryCheck, 50); return; }
      checkOverflow(textEl, readMore);
    }
    setTimeout(tryCheck, 50);
    setTimeout(function () { checkOverflow(textEl, readMore); }, 300);
    setTimeout(function () { checkOverflow(textEl, readMore); }, 700);
  }

  function scanForBlocks() {
    document.querySelectorAll('.note-details_meal-content').forEach(initReadMore);
  }

  scanForBlocks();
  var observer = new MutationObserver(scanForBlocks);
  observer.observe(document.body, { childList: true, subtree: true });
});

window.addEventListener('load', function() {
  var checkData = setInterval(function() {
    if (window.Wized?.data?.r?.get_recipe?.data?.[0]) {
      clearInterval(checkData);
      var recipe         = window.Wized.data.r.get_recipe.data[0];
      var img            = document.querySelector('[wized="note-media_image"]') || document.querySelector('.note-media_image');
      var mediaContainer = document.querySelector('[wized="note-media"]') || (img ? img.closest('.note-media') : null);
      var hasPhoto       = recipe.photo_url && recipe.photo_url !== 'null' && recipe.photo_url !== '';

      if (hasPhoto && img) {
        img.src = recipe.photo_url;
        img.srcset = '';
        if (mediaContainer) mediaContainer.style.display = '';
      } else if (img) {
        img.removeAttribute('src');
        img.removeAttribute('srcset');
        if (mediaContainer) mediaContainer.style.display = 'none';
      }

      if (recipe.note_details && window.DOMPurify) {
        var clean  = DOMPurify.sanitize(recipe.note_details, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: []
        });
        var noteEl = document.querySelector('[wized="note_details_display"]');
        if (noteEl) noteEl.innerHTML = clean;
      }

      var username   = recipe.profiles && recipe.profiles.username;
      var handleLink = document.querySelector('[wized="member-handle-link"]');
      if (handleLink && username) {
        handleLink.href = '/member-profile?username=' + encodeURIComponent(username);
        var handleText  = handleLink.querySelector('div') || handleLink;
        handleText.textContent = '@' + username;
      }
    }
  }, 200);
  setTimeout(function() { clearInterval(checkData); }, 10000);
});

window.addEventListener('load', function () {

  var SUPABASE_URL      = 'https://houohobadselkswaxwsy.supabase.co';
  var SUPABASE_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW9ob2JhZHNlbGtzd2F4d3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM0NTIsImV4cCI6MjA4OTY4OTQ1Mn0.hOBki3aRyTqOFy3CJZmrNBBULDoRxb9xRjz8iDUEMjo';
  var EDGE_FUNCTION_URL = 'https://houohobadselkswaxwsy.supabase.co/functions/v1/validate-upload?context=note';
  var NOTES_PER_PAGE    = 6;

  var THOUGHTS_MIN = 10;
  var THOUGHTS_MAX = 100;
  var TRIED_MIN    = 4;
  var TRIED_MAX    = 60;
  var MEAL_MIN     = 50;
  var MEAL_MAX     = 1000;

  var _authToken = null;
  try {
    var _stored = localStorage.getItem('sb-houohobadselkswaxwsy-auth-token');
    _authToken  = _stored ? JSON.parse(_stored).access_token : null;
  } catch(e) {}

  var _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: _authToken ? 'Bearer ' + _authToken : '' } },
    auth:   { persistSession: false }
  });
  window._recipeSupabase = _supabase;

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

  var _session      = null;
  var _selectedFile = null;
  var _recipeId     = null;
  var _createQuill  = null;
  var _allNotes     = [];
  var _expanded     = false;

  var _errorTimer   = null;
  var _successTimer = null;

  function showNoteError(msg) {
    var el = document.querySelector('[wized="note-create_error"]');
    if (!el) return;
    el.textContent = msg;
    el.style.setProperty('display', 'block', 'important');
    var successEl = document.querySelector('[wized="note-create_success"]');
    if (successEl) successEl.style.setProperty('display', 'none', 'important');
    if (_errorTimer) clearTimeout(_errorTimer);
    _errorTimer = setTimeout(function() {
      el.style.setProperty('display', 'none', 'important');
    }, 5000);
  }

  function showNoteSuccess(msg) {
    var el = document.querySelector('[wized="note-create_success"]');
    if (!el) return;
    el.textContent = msg;
    el.style.setProperty('display', 'block', 'important');
    var errorEl = document.querySelector('[wized="note-create_error"]');
    if (errorEl) errorEl.style.setProperty('display', 'none', 'important');
    if (_successTimer) clearTimeout(_successTimer);
    _successTimer = setTimeout(function() {
      el.style.setProperty('display', 'none', 'important');
    }, 4000);
  }

  function clearFeedback() {
    var errorEl   = document.querySelector('[wized="note-create_error"]');
    var successEl = document.querySelector('[wized="note-create_success"]');
    if (errorEl)   errorEl.style.setProperty('display', 'none', 'important');
    if (successEl) successEl.style.setProperty('display', 'none', 'important');
  }

  function updateCounter(counterEl, current, min, max) {
    if (!counterEl) return;
    if (current === 0) {
      counterEl.textContent = '0 / ' + max + ' characters';
      counterEl.style.color = '';
    } else if (current < min) {
      counterEl.textContent = 'Needs min ' + min + ' characters (' + current + ' so far)';
      counterEl.style.color = '#D77F42';
    } else if (current > max) {
      counterEl.textContent = current + ' / ' + max + ' — too long';
      counterEl.style.color = '#ff4d4d';
    } else {
      counterEl.textContent = current + ' / ' + max + ' characters';
      counterEl.style.color = '#64794E';
    }
  }

  function getPaginationAnchor() {
    var list = document.querySelector('.member-notes_list');
    if (!list) return null;
    var wrap = list.querySelector('.member-notes_button-comments');
    if (wrap) {
      var anchor = wrap.closest('.member-notes_show-comments');
      if (anchor && anchor.parentElement === list) return anchor;
      return wrap;
    }
    return null;
  }

  function syncNotesFromWized() {
    var live = window.Wized?.data?.r?.get_notes?.data;
    if (Array.isArray(live)) _allNotes = live.slice();
    return _allNotes;
  }

  var checkReady = setInterval(async function () {
    var recipe = window.Wized?.data?.r?.get_recipe?.data?.[0];
    if (!recipe) return;
    clearInterval(checkReady);
    _recipeId = recipe.id;

    var authorAvatarImg = document.querySelector('[wized="author_avatar_icon"]');
    if (authorAvatarImg && recipe.profiles?.avatar_selection) {
      var avatarUrl = avatarMap[recipe.profiles.avatar_selection];
      if (avatarUrl) {
        authorAvatarImg.removeAttribute('srcset');
        authorAvatarImg.removeAttribute('sizes');
        authorAvatarImg.src = avatarUrl;
        var isCreator = recipe.author_role === 'Creator';
        authorAvatarImg.style.width  = '2rem';
        authorAvatarImg.style.height = isCreator ? '2rem' : '2.5rem';
      }
    }

    if (_authToken) {
      try {
        var payload = JSON.parse(atob(_authToken.split('.')[1]));
        _session = { user: { id: payload.sub } };
      } catch(e) {}
    }

    initCreateQuill();
    initCreateForm();
    initSorting();
    waitForNotesAndRender();
    initLoadMoreButton();
  }, 200);

  setTimeout(function () { clearInterval(checkReady); }, 10000);

  function initCreateQuill() {
    var syncInput = document.querySelector('.create-note_form-details-input');
    if (syncInput) syncInput.style.setProperty('display', 'none', 'important');

    var mountEl = document.getElementById('quill-create-note');
    if (!mountEl || !window.Quill) return;

    _createQuill = new Quill('#quill-create-note', {
      theme: 'snow',
      placeholder: 'Marinated a pound of skirt steak overnight...',
      modules: {
        toolbar: [
          ['bold'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean']
        ]
      }
    });

    _createQuill.root.style.fontStyle = 'normal';

    _createQuill.on('text-change', function () {
      var mealCounterEl = document.querySelector('[wized="note-meal-counter"]');
      var len = getQuillText().length;
      updateCounter(mealCounterEl, len, MEAL_MIN, MEAL_MAX);
      validateForm();
    });
  }

  function getQuillText() {
    if (!_createQuill) return '';
    return _createQuill.getText().trim();
  }

  function getQuillHTML() {
    if (!_createQuill) return '';
    var text = getQuillText();
    if (text === '') return '';
    var html = _createQuill.root.innerHTML;
    if (!html || html === '<p><br></p>') return '';
    return html;
  }

  function validateForm() {
    var submitBtn = document.querySelector('.note-create_submit');
    if (!submitBtn) return;

    if (!_session) {
      submitBtn.style.opacity       = '1';
      submitBtn.style.pointerEvents = 'auto';
      return;
    }

    var thoughtsEl = document.querySelector('.note-create_input-thoughts');
    var triedEl    = document.querySelector('.note-create_input-tried');
    var thoughts   = thoughtsEl ? thoughtsEl.value.trim() : '';
    var tried      = triedEl    ? triedEl.value.trim()    : '';
    var mealLen    = getQuillText().length;

    var thoughtsOk = thoughts.length >= THOUGHTS_MIN && thoughts.length <= THOUGHTS_MAX;
    var triedOk    = tried.length    >= TRIED_MIN    && tried.length    <= TRIED_MAX;
    var mealOk     = mealLen === 0   || (mealLen >= MEAL_MIN && mealLen <= MEAL_MAX);

    var isValid = thoughtsOk && triedOk && mealOk;
    submitBtn.style.opacity       = isValid ? '1'    : '0.4';
    submitBtn.style.pointerEvents = isValid ? 'auto' : 'none';
  }

  function initCreateForm() {
    var submitBtn       = document.querySelector('.note-create_submit');
    var statusEl        = document.querySelector('.text-note-create_upload-status');
    var thoughtsEl      = document.querySelector('.note-create_input-thoughts');
    var triedEl         = document.querySelector('.note-create_input-tried');
    var avatarImg       = document.querySelector('.note-create_card .note-author_avatar img');
    var usernameEl      = document.querySelector('.note-create_card .text-note_username');
    var thoughtsCounter = document.querySelector('[wized="note-thoughts-counter"]');
    var triedCounter    = document.querySelector('[wized="note-tried-counter"]');
    var mealCounter     = document.querySelector('[wized="note-meal-counter"]');

    updateCounter(thoughtsCounter, 0, THOUGHTS_MIN, THOUGHTS_MAX);
    updateCounter(triedCounter,    0, TRIED_MIN,    TRIED_MAX);
    updateCounter(mealCounter,     0, MEAL_MIN,     MEAL_MAX);

    if (submitBtn) {
      if (_session) {
        submitBtn.style.opacity       = '0.4';
        submitBtn.style.pointerEvents = 'none';
      } else {
        submitBtn.style.opacity       = '1';
        submitBtn.style.pointerEvents = 'auto';
        var authPrompt = document.querySelector('[wized="note-auth-prompt"]');
        submitBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (authPrompt) authPrompt.style.setProperty('display', 'flex', 'important');
        });
      }
    }

    if (_session) {
      _supabase
        .from('profiles')
        .select('username, avatar_selection')
        .eq('id', _session.user.id)
        .single()
        .then(function (res) {
          if (!res.data) return;
          if (usernameEl) usernameEl.textContent = '@' + res.data.username;
          if (avatarImg && res.data.avatar_selection) {
            var url = avatarMap[res.data.avatar_selection];
            if (url) {
              avatarImg.removeAttribute('srcset');
              avatarImg.removeAttribute('sizes');
              avatarImg.src = url;
            }
          }
        });
    }

    if (thoughtsEl) {
      thoughtsEl.addEventListener('input', function() {
        updateCounter(thoughtsCounter, thoughtsEl.value.trim().length, THOUGHTS_MIN, THOUGHTS_MAX);
        validateForm();
      });
    }
    if (triedEl) {
      triedEl.addEventListener('input', function() {
        updateCounter(triedCounter, triedEl.value.trim().length, TRIED_MIN, TRIED_MAX);
        validateForm();
      });
    }

    var fileInput    = document.createElement('input');
    fileInput.type   = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/webp';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    var fileBtn = document.querySelector('.note-image_upload-button');
    if (fileBtn) {
      fileBtn.style.cursor = 'pointer';
      fileBtn.addEventListener('click', function () {
        if (!_session) { showNoteError('Please log in to upload a photo.'); return; }
        fileInput.click();
      });
    }

    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        if (statusEl) statusEl.textContent = 'Photo must be under 5MB.';
        _selectedFile = null;
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var MAX = 1200;
          var w = img.width, h = img.height;
          if (w > MAX) { h = (MAX / w) * h; w = MAX; }
          if (h > MAX) { w = (MAX / h) * w; h = MAX; }

          var canvas = document.createElement('canvas');
          canvas.width  = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);

          canvas.toBlob(function (blob) {
            _selectedFile = new File([blob], file.name, { type: 'image/jpeg' });
            var displayName = file.name.length > 25
              ? file.name.substring(0, 25) + '...'
              : file.name;
            if (statusEl) statusEl.textContent = displayName;
            validateForm();
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', async function () {
        if (!_session) return;

        clearFeedback();

        var thoughts = thoughtsEl ? thoughtsEl.value.trim() : '';
        var tried    = triedEl    ? triedEl.value.trim()    : '';
        var mealHTML = getQuillHTML();
        var mealText = getQuillText();

        if (thoughts.length < THOUGHTS_MIN || thoughts.length > THOUGHTS_MAX) return;
        if (tried.length    < TRIED_MIN    || tried.length    > TRIED_MAX)    return;
        if (mealText.length > 0 && mealText.length < MEAL_MIN)                return;
        if (mealText.length > MEAL_MAX)                                        return;

        submitBtn.style.opacity       = '0.5';
        submitBtn.style.pointerEvents = 'none';

        try {
          var photoUrl = null;

          if (_selectedFile) {
            if (statusEl) statusEl.textContent = 'Uploading...';

            var formData = new FormData();
            formData.append('file', _selectedFile);

            var uploadRes = await fetch(EDGE_FUNCTION_URL, {
              method:  'POST',
              headers: { 'Authorization': 'Bearer ' + _authToken },
              body:    formData
            });

            var uploadResult = await uploadRes.json();

            if (!uploadResult.photo_url) {
              showNoteError(uploadResult.error || 'Photo upload failed. Please try again.');
              submitBtn.style.opacity       = '1';
              submitBtn.style.pointerEvents = 'auto';
              if (statusEl) statusEl.textContent = 'Upload failed';
              return;
            }

            photoUrl = uploadResult.photo_url;
          }

          var { data: newNote, error: insertError } = await _supabase
            .from('notes')
            .insert({
              recipe_id:      _recipeId,
              user_id:        _session.user.id,
              sauce_thoughts: thoughts,
              tried_it_on:    tried,
              meal_details:   mealHTML || null,
              photo_url:      photoUrl
            })
            .select()
            .single();

          if (insertError) {
            var msg = insertError.message || '';
            if (msg.includes('note_rate_limit_exceeded')) {
              showNoteError('You\'ve reached the note limit for today. Try again tomorrow.');
            } else if (msg.includes('sauce_thoughts contains inappropriate content')) {
              showNoteError('Your sauce thoughts contain prohibited content. Please revise.');
            } else if (msg.includes('tried_it_on contains inappropriate content')) {
              showNoteError('Your "tried it on" field contains prohibited content. Please revise.');
            } else if (msg.includes('meal_details contains inappropriate content')) {
              showNoteError('Your meal details contain prohibited content. Please revise.');
            } else if (msg.includes('sauce_thoughts_safe')) {
              showNoteError('Your sauce thoughts contain invalid content or characters.');
            } else if (msg.includes('tried_it_on_safe')) {
              showNoteError('Your "tried it on" field contains invalid content or characters.');
            } else if (msg.includes('meal_details_safe')) {
              showNoteError('Your meal details contain invalid content or are too long.');
            } else {
              showNoteError('Could not submit your note. Please try again.');
            }
            return;
          }

          if (thoughtsEl) thoughtsEl.value = '';
          if (triedEl)    triedEl.value    = '';
          if (_createQuill) _createQuill.setText('');
          if (statusEl) statusEl.textContent = 'No File Chosen';
          _selectedFile   = null;
          fileInput.value = '';

          updateCounter(thoughtsCounter, 0, THOUGHTS_MIN, THOUGHTS_MAX);
          updateCounter(triedCounter,    0, TRIED_MIN,    TRIED_MAX);
          updateCounter(mealCounter,     0, MEAL_MIN,     MEAL_MAX);

          showNoteSuccess('Your note was posted!');

          var { data: profileRes } = await _supabase
            .from('profiles')
            .select('username, avatar_selection')
            .eq('id', _session.user.id)
            .single();

          newNote.profiles = profileRes || {};
          _allNotes.unshift(newNote);
          renderNotes(true);
          handleEmptyState(false);

        } catch (err) {
          showNoteError('Something went wrong. Please try again.');
        } finally {
          validateForm();
        }
      });
    }
  }

  var _currentSort = 'newest';

  function initSorting() {
    var trigger     = document.querySelector('[wized="sort-trigger"]');
    var panel       = document.querySelector('[wized="sort-panel"]');
    var radioNewest = document.querySelector('[wized="sort-newest"]');
    var radioOldest = document.querySelector('[wized="sort-oldest"]');
    var radioMine   = document.querySelector('[wized="sort-mine"]');

    if (panel)       panel.style.setProperty('display', 'none', 'important');
    if (radioNewest) radioNewest.checked = true;
    if (radioOldest) radioOldest.checked = false;
    if (radioMine)   radioMine.checked   = false;

    if (trigger) {
      trigger.style.cursor = 'pointer';
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!panel) return;
        var isOpen = panel.style.display !== 'none';
        panel.style.setProperty('display', isOpen ? 'none' : 'flex', 'important');
      });
    }

    document.addEventListener('click', function() {
      if (panel) panel.style.setProperty('display', 'none', 'important');
    });

    function applySort(newSort) {
      _currentSort = newSort;
      _expanded    = false;
      renderNotes(true);
      if (panel) panel.style.setProperty('display', 'none', 'important');
    }

    if (radioNewest) {
      radioNewest.addEventListener('change', function() {
        if (radioNewest.checked) applySort('newest');
      });
    }
    if (radioOldest) {
      radioOldest.addEventListener('change', function() {
        if (radioOldest.checked) applySort('oldest');
      });
    }
    if (radioMine) {
      radioMine.addEventListener('change', function() {
        if (radioMine.checked) {
          if (!_session) { radioMine.checked = false; if (radioNewest) radioNewest.checked = true; return; }
          applySort('mine');
        }
      });
    }
  }

  function initLoadMoreButton() {
    var anchor = getPaginationAnchor();
    if (!anchor) return;
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      _expanded = !_expanded;
      renderNotes(false);
    }, true);
  }

  function waitForNotesAndRender() {
    var checkNotes = setInterval(function () {
      var req = window.Wized?.data?.r?.get_notes;
      if (!req) return;
      if (req.isRequesting) return;
      if (!Array.isArray(req.data)) return;
      clearInterval(checkNotes);
      setTimeout(function () {
        syncNotesFromWized();
        renderNotes(false);
      }, 300);
    }, 200);
    setTimeout(function () { clearInterval(checkNotes); }, 15000);
  }

  function renderNotes(skipSync) {
    var list     = document.querySelector('.member-notes_list');
    var template = document.querySelector('.note-card_member');
    var anchor   = getPaginationAnchor();
    if (!list || !template) return;

    if (!skipSync) syncNotesFromWized();

    list.querySelectorAll('.note-card_member[data-note-id]').forEach(function (el) { el.remove(); });
    list.querySelectorAll('.note-card_member:not([data-note-id])').forEach(function (el) {
      if (el !== template) el.remove();
    });

    template.style.setProperty('display', 'none', 'important');

    handleEmptyState(_allNotes.length === 0);
    if (_allNotes.length === 0) {
      if (anchor) anchor.style.setProperty('display', 'none', 'important');
      return;
    }

    var notes = _allNotes.slice();
    if (_currentSort === 'oldest') {
      notes.sort(function(a, b) { return new Date(a.created_at) - new Date(b.created_at); });
    } else if (_currentSort === 'mine') {
      notes = _session ? notes.filter(function(n) { return n.user_id === _session.user.id; }) : [];
    }

    var count  = _expanded ? notes.length : Math.min(NOTES_PER_PAGE, notes.length);
    var toShow = notes.slice(0, count);

    toShow.forEach(function (note) {
      var card = buildNoteCard(note);
      if (anchor && anchor.parentElement === list) list.insertBefore(card, anchor);
      else list.appendChild(card);
    });

    if (anchor) {
      if (notes.length <= NOTES_PER_PAGE) {
        anchor.style.setProperty('display', 'none', 'important');
      } else {
        anchor.style.setProperty('display', 'flex', 'important');
        var icon    = anchor.querySelector('.icon_dropdown-comments');
        var btnText = anchor.querySelector('.member-notes_button-text');
        if (icon) {
          icon.style.transition = 'transform 0.3s ease';
          icon.style.transform  = _expanded ? 'rotate(180deg)' : 'rotate(0deg)';
        }
        if (btnText) btnText.textContent = _expanded ? 'View Less Notes' : 'View More Notes';
      }
    }
  }

  function handleEmptyState(isEmpty) {
    var wrapper      = document.querySelector('.member-notes_controls-empty');
    var loggedOut    = document.querySelector('.empty-state_logged-out');
    var loggedIn     = document.querySelector('.empty-state_logged-in');
    var controlInner = document.querySelector('.member-notes_controls-inner');

    if (!isEmpty) {
      if (wrapper)      wrapper.style.setProperty('display', 'none', 'important');
      if (controlInner) controlInner.style.removeProperty('display');
      return;
    }

    if (controlInner) controlInner.style.setProperty('display', 'none', 'important');

    if (_session) {
      if (loggedOut) loggedOut.style.setProperty('display', 'none', 'important');
      if (loggedIn)  loggedIn.style.removeProperty('display');
    } else {
      if (loggedOut) loggedOut.style.removeProperty('display');
      if (loggedIn)  loggedIn.style.setProperty('display', 'none', 'important');
    }

    if (wrapper) wrapper.style.removeProperty('display');
  }

  function buildNoteCard(note) {
    var template = document.querySelector('.note-card_member');
    var card     = template.cloneNode(true);
    card.style.removeProperty('display');
    card.setAttribute('data-note-id', note.id);
    card.setAttribute('data-note-owner-id', note.user_id || '');

    // note-card_member has a 72px flex gap which creates a huge space between
    // note-card_inner and note-engagement when optional blocks are removed.
    // Override it to a sensible value.
    card.style.setProperty('row-gap', '1rem', 'important');

    var mealContent = card.querySelector('.note-details_meal-content');
    if (mealContent) mealContent.removeAttribute('data-read-more-init');

    var avatarImg = card.querySelector('.note-author_avatar img') ||
                    card.querySelector('.note-author_avatar');
    if (avatarImg && note.profiles?.avatar_selection) {
      var url = avatarMap[note.profiles.avatar_selection];
      if (url) {
        avatarImg.removeAttribute('srcset');
        avatarImg.removeAttribute('sizes');
        avatarImg.src = url;
      }
    }

    var usernameEl = card.querySelector('.text-note_username');
    if (usernameEl) {
      usernameEl.textContent  = '@' + (note.profiles?.username || 'member');
      usernameEl.style.cursor = 'pointer';
      usernameEl.addEventListener('click', function () {
        window.location.href = '/member-profile?username=' +
          encodeURIComponent(note.profiles?.username || '');
      });
    }

    var thoughtsBlock = card.querySelector('.note-card_thoughts');
    if (thoughtsBlock) {
      var tEls = thoughtsBlock.querySelectorAll('.text-size-medium');
      if (tEls[1]) tEls[1].textContent = note.sauce_thoughts || '';
    }

    var triedBlock = card.querySelector('.note-card_tried');
    if (triedBlock) {
      var rEls = triedBlock.querySelectorAll('.text-size-medium');
      if (rEls[1]) rEls[1].textContent = note.tried_it_on || '';
    }

    var detailsBlock = card.querySelector('.note-card_details');
    if (detailsBlock) {
      var mealTextEl    = detailsBlock.querySelector('.note-details_meal-text p') ||
                          detailsBlock.querySelector('.note-details_meal-text');
      var mealContentEl = detailsBlock.querySelector('.note-details_meal-content');
      var hasMeal       = note.meal_details &&
                          note.meal_details.trim() !== '' &&
                          note.meal_details !== '<p><br></p>';
      if (hasMeal) {
        if (mealTextEl) {
          mealTextEl.innerHTML = window.DOMPurify
            ? DOMPurify.sanitize(note.meal_details, {
                ALLOWED_TAGS: ['b', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
                ALLOWED_ATTR: []
              })
            : note.meal_details;
        }
        if (mealContentEl) mealContentEl.style.removeProperty('display');
        detailsBlock.style.removeProperty('display');
      } else {
        // No meal details — remove the block entirely so it can't leave a gap
        detailsBlock.remove();
      }
    }

    var mediaEl  = card.querySelector('.note-media');
    var mediaImg = card.querySelector('.note-media_image');
    if (note.photo_url) {
      if (mediaImg) {
        mediaImg.removeAttribute('srcset');
        mediaImg.removeAttribute('sizes');
        mediaImg.src = note.photo_url;
      }
      if (mediaEl) mediaEl.style.removeProperty('display');
    } else {
      // No photo — remove the media block entirely so it can't leave a gap
      if (mediaEl) mediaEl.remove();
    }

    // Override the flex row gap on note-card_inner to a tighter value —
    // the Webflow default (5.5rem) is too large on mobile when optional
    // blocks (details, media) are absent.
    var cardInner = card.querySelector('.note-card_inner');
    if (cardInner) cardInner.style.setProperty('row-gap', '1rem', 'important');

    var badgeEl = card.querySelector('.note-meta_badge');
    if (badgeEl) badgeEl.style.setProperty('display', 'none', 'important');

    var editLinkEl = card.querySelector('[wized="note-card-edit-link"]');
    if (editLinkEl) {
      var isOwnNote = _session && note.user_id === _session.user.id;
      if (isOwnNote) {
        editLinkEl.style.cursor = 'pointer';
        editLinkEl.style.removeProperty('display');
        editLinkEl.addEventListener('click', function () {
          window.location.href = 'https://sauce-share-4c2702.webflow.io/edit-note?type=community&id=' + note.id;
        });
      } else {
        editLinkEl.style.setProperty('display', 'none', 'important');
      }
    }

    return card;
  }

});

window.addEventListener('load', function () {

  var SUPABASE_URL = 'https://houohobadselkswaxwsy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW9ob2JhZHNlbGtzd2F4d3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM0NTIsImV4cCI6MjA4OTY4OTQ1Mn0.hOBki3aRyTqOFy3CJZmrNBBULDoRxb9xRjz8iDUEMjo';

  var _authToken = null;
  try {
    var _stored = localStorage.getItem('sb-houohobadselkswaxwsy-auth-token');
    _authToken  = _stored ? JSON.parse(_stored).access_token : null;
  } catch(e) {}

  var _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: _authToken ? 'Bearer ' + _authToken : '' } },
    auth:   { persistSession: false }
  });

  var _session   = null;
  var _recipeId  = null;
  var _favorited = false;
  var _busy      = false;

  if (_authToken) {
    try {
      var payload = JSON.parse(atob(_authToken.split('.')[1]));
      _session = { user: { id: payload.sub } };
    } catch(e) {}
  }

  var favBtn = document.querySelector('[wized="recipe-favorite-btn"]');

  function setFavoritedState(isFavorited) {
    _favorited = isFavorited;
    var iInactive = document.querySelector('[wized="favorite-icon-inactive"]');
    var iActive   = document.querySelector('[wized="favorite-icon-active"]');
    var tInactive = document.querySelector('[wized="favorite-text-inactive"]');
    var tActive   = document.querySelector('[wized="favorite-text-active"]');
    if (iInactive) iInactive.style.setProperty('display', isFavorited ? 'none'  : 'block', 'important');
    if (iActive)   iActive.style.setProperty('display',   isFavorited ? 'block' : 'none',  'important');
    if (tInactive) tInactive.style.setProperty('display', isFavorited ? 'none'  : 'block', 'important');
    if (tActive)   tActive.style.setProperty('display',   isFavorited ? 'block' : 'none',  'important');
  }

  async function checkFavoriteStatus(recipeId) {
    if (!_session) return;
    try {
      var { data } = await _supabase
        .from('favorites')
        .select('id')
        .eq('user_id', _session.user.id)
        .eq('recipe_id', recipeId)
        .maybeSingle();
      setFavoritedState(!!data);
    } catch(e) {}
  }

  async function toggleFavorite() {
    if (!_session) {
      window.location.href = 'https://sauce-share-4c2702.webflow.io/sign-up';
      return;
    }
    if (_busy || !_recipeId) return;
    _busy = true;
    if (favBtn) { favBtn.style.opacity = '0.5'; favBtn.style.pointerEvents = 'none'; }
    try {
      if (_favorited) {
        await _supabase.from('favorites').delete()
          .eq('user_id', _session.user.id).eq('recipe_id', _recipeId);
        setFavoritedState(false);
      } else {
        await _supabase.from('favorites').insert({ user_id: _session.user.id, recipe_id: _recipeId });
        setFavoritedState(true);
      }
    } catch(e) {}
    _busy = false;
    if (favBtn) { favBtn.style.opacity = ''; favBtn.style.pointerEvents = ''; }
  }

  if (favBtn) {
    favBtn.style.cursor = 'pointer';
    favBtn.addEventListener('click', function() { toggleFavorite(); });
  }

  var editBtn           = document.querySelector('[wized="recipe-edit-btn"]');
  var experienceHeading = document.querySelector('[wized="recipe-experience-heading"]');
  if (editBtn) editBtn.style.setProperty('display', 'none', 'important');

  var checkReady = setInterval(function() {
    var recipe = window.Wized?.data?.r?.get_recipe?.data?.[0];
    if (!recipe) return;
    clearInterval(checkReady);
    _recipeId = recipe.id;

    var isOwner = _session && _session.user.id === recipe.user_id;
    if (experienceHeading) experienceHeading.textContent = isOwner ? 'Your Recipe' : 'Your Experience';
    setFavoritedState(false);

    if (isOwner) {
      if (favBtn) favBtn.style.setProperty('display', 'none', 'important');
      if (editBtn) {
        editBtn.style.setProperty('display', 'flex', 'important');
        editBtn.style.cursor = 'pointer';
        editBtn.addEventListener('click', function() {
          window.location.href = 'https://sauce-share-4c2702.webflow.io/edit-recipe?slug=' + (recipe.slug || '');
        });
      }
    } else {
      if (editBtn) editBtn.style.setProperty('display', 'none', 'important');
      checkFavoriteStatus(_recipeId);
    }
  }, 200);
  setTimeout(function() { clearInterval(checkReady); }, 10000);

});

window.addEventListener('load', function () {

  var SUPABASE_URL = 'https://houohobadselkswaxwsy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW9ob2JhZHNlbGtzd2F4d3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM0NTIsImV4cCI6MjA4OTY4OTQ1Mn0.hOBki3aRyTqOFy3CJZmrNBBULDoRxb9xRjz8iDUEMjo';

  var _authToken = null;
  try {
    var _stored = localStorage.getItem('sb-houohobadselkswaxwsy-auth-token');
    _authToken  = _stored ? JSON.parse(_stored).access_token : null;
  } catch(e) {}

  var _supabase = window._recipeSupabase || supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: _authToken ? 'Bearer ' + _authToken : '' } },
    auth:   { persistSession: false }
  });

  var _session          = null;
  var _recipeId         = null;
  var _favoritedNoteIds = new Set();

  if (_authToken) {
    try {
      var payload = JSON.parse(atob(_authToken.split('.')[1]));
      _session = { user: { id: payload.sub } };
    } catch(e) {}
  }

  async function fetchFavoritedNotes() {
    if (!_session) return;
    try {
      var { data } = await _supabase
        .from('note_favorites')
        .select('note_id')
        .eq('user_id', _session.user.id);
      if (data) {
        data.forEach(function(row) { _favoritedNoteIds.add(row.note_id); });
      }
    } catch(e) {}
  }

  function wirePinnedNoteHeart(card) {
    var btn      = card.querySelector('[wized="note-favorite-btn"]');
    var active   = card.querySelector('[wized="note-favorite-active"]');
    var inactive = card.querySelector('[wized="note-favorite-inactive"]');
    if (!btn) return;
    if (active)   active.style.setProperty('display',   'none',  'important');
    if (inactive) inactive.style.setProperty('display', 'block', 'important');
    btn.style.cursor = 'pointer';
    var _pinnedActive = false;
    btn.addEventListener('click', function() {
      _pinnedActive = !_pinnedActive;
      if (active)   active.style.setProperty('display',   _pinnedActive ? 'block' : 'none',  'important');
      if (inactive) inactive.style.setProperty('display', _pinnedActive ? 'none'  : 'block', 'important');
    });
  }

  function wireNoteFavorite(card, noteId, noteOwnerId) {
    var btn      = card.querySelector('[wized="note-favorite-btn"]');
    var active   = card.querySelector('[wized="note-favorite-active"]');
    var inactive = card.querySelector('[wized="note-favorite-inactive"]');
    if (!btn) return;

    var isOwn = _session && noteOwnerId === _session.user.id;
    if (!_session || isOwn) {
      btn.style.setProperty('display', 'none', 'important');
      return;
    }

    var isFavorited = _favoritedNoteIds.has(noteId);
    setHeartState(active, inactive, isFavorited);

    var _busy = false;
    btn.style.cursor = 'pointer';

    document.addEventListener('click', function(e) {
      if (!btn.contains(e.target)) return;
      if (_busy) return;
      _busy = true;
      btn.style.opacity = '0.5';
      var nowFavorited = _favoritedNoteIds.has(noteId);
      if (nowFavorited) {
        _supabase.from('note_favorites').delete()
          .eq('user_id', _session.user.id).eq('note_id', noteId)
          .then(function(res) {
            if (!res.error) { _favoritedNoteIds.delete(noteId); setHeartState(active, inactive, false); }
            btn.style.opacity = '';
            _busy = false;
          });
      } else {
        _supabase.from('note_favorites').insert({ user_id: _session.user.id, note_id: noteId })
          .then(function(res) {
            if (!res.error) { _favoritedNoteIds.add(noteId); setHeartState(active, inactive, true); }
            btn.style.opacity = '';
            _busy = false;
          });
      }
    }, true);
  }

  function setHeartState(active, inactive, isFavorited) {
    if (active)   active.style.setProperty('display',   isFavorited ? 'block' : 'none',  'important');
    if (inactive) inactive.style.setProperty('display', isFavorited ? 'none'  : 'block', 'important');
  }

  function wirePinnedNoteCard(recipe) {
    var card = document.querySelector('[wized="recipe-pinned-note-card"]');
    if (!card) return;

    var usernameEl = card.querySelector('[wized="note-username"]');
    if (usernameEl && recipe.profiles?.username) {
      usernameEl.textContent  = '@' + recipe.profiles.username;
      usernameEl.style.cursor = 'pointer';
      usernameEl.addEventListener('click', function() {
        window.location.href = '/member-profile?username=' +
          encodeURIComponent(recipe.profiles.username);
      });
    }

    var ownerLabel  = card.querySelector('[wized="pinned-note-owner-label"]');
    var isOwnRecipe = _session && recipe.user_id === _session.user.id;
    if (ownerLabel) {
      ownerLabel.removeAttribute('href');
      ownerLabel.style.cursor        = 'default';
      ownerLabel.style.pointerEvents = 'none';
      ownerLabel.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); });
      if (isOwnRecipe) {
        ownerLabel.style.setProperty('display', 'block', 'important');
      } else {
        ownerLabel.style.setProperty('display', 'none', 'important');
      }
    }

    var heartBtn = card.querySelector('[wized="note-favorite-btn"]') ||
                   card.querySelector('[wized="note-favorite-active"]')?.parentElement ||
                   card.querySelector('.note-engagement_upvote-count');
    if (heartBtn) heartBtn.style.setProperty('display', 'none', 'important');
    ['[wized="note-favorite-active"]','[wized="note-favorite-inactive"]'].forEach(function(sel) {
      var el = card.querySelector(sel);
      if (el) el.style.setProperty('display', 'none', 'important');
    });
  }

  function wireCommunityNoteCards() {
    document.querySelectorAll('[data-note-id]').forEach(function(card) {
      var noteId      = card.getAttribute('data-note-id');
      var noteOwnerId = card.getAttribute('data-note-owner-id');
      if (!noteId || card._favoriteWired) return;
      card._favoriteWired = true;
      wireNoteFavorite(card, noteId, noteOwnerId);
    });
  }

  var observer = new MutationObserver(function() { wireCommunityNoteCards(); });
  observer.observe(document.body, { childList: true, subtree: true });

  var checkReady = setInterval(async function() {
    var recipe = window.Wized?.data?.r?.get_recipe?.data?.[0];
    if (!recipe) return;
    clearInterval(checkReady);
    _recipeId = recipe.id;
    await fetchFavoritedNotes();
    wirePinnedNoteCard(recipe);
    wireCommunityNoteCards();
  }, 200);

  setTimeout(function() { clearInterval(checkReady); }, 10000);

});

window.addEventListener('load', function() {

  var SUPABASE_URL = 'https://houohobadselkswaxwsy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW9ob2JhZHNlbGtzd2F4d3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTM0NTIsImV4cCI6MjA4OTY4OTQ1Mn0.hOBki3aRyTqOFy3CJZmrNBBULDoRxb9xRjz8iDUEMjo';

  var _authToken = null;
  try {
    var _stored = localStorage.getItem('sb-houohobadselkswaxwsy-auth-token');
    _authToken  = _stored ? JSON.parse(_stored).access_token : null;
  } catch(e) {}

  var _supabase = window._recipeSupabase || supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: _authToken ? 'Bearer ' + _authToken : '' } },
    auth:   { persistSession: false }
  });

  var _session = null;
  if (_authToken) {
    try {
      var payload = JSON.parse(atob(_authToken.split('.')[1]));
      _session = { user: { id: payload.sub } };
    } catch(e) {}
  }

  var modal             = document.querySelector('[wized="share-modal"]');
  var closeBtn          = document.querySelector('[wized="share-modal-close"]');
  var shareBtn          = document.querySelector('[wized="recipe-share"]');
  var modalHeading      = document.querySelector('[wized="share-modal-heading"]');
  var modalSubheading   = document.querySelector('[wized="share-modal-subheading"]');
  var pinterest         = document.querySelector('[wized="share-pinterest"]');
  var facebook          = document.querySelector('[wized="share-facebook"]');
  var reddit            = document.querySelector('[wized="share-reddit"]');
  var twitter           = document.querySelector('[wized="share-twitter"]');
  var whatsapp          = document.querySelector('[wized="share-whatsapp"]');
  var copyLinkBtn       = document.querySelector('[wized="share-copy-link"]');
  var copyConfirm       = document.querySelector('[wized="share-copy-confirm"]');
  var emailHeader       = document.querySelector('[wized="share-email-header"]');
  var emailContent      = document.querySelector('[wized="share-email-content"]');
  var emailChevron      = document.querySelector('[wized="share-email-chevron"]');
  var sendSomeone       = document.querySelector('[wized="share-send-someone"]');
  var sendMyself        = document.querySelector('[wized="share-send-myself"]');
  var emailInput        = document.querySelector('[wized="share-email-input"]');
  var sendBtn           = document.querySelector('[wized="share-send-btn"]');
  var newsletterCb      = document.querySelector('[wized="share-newsletter-checkbox"]');
  var newsletterContent = document.querySelector('[wized="share-newsletter-content"]');
  var successEl         = document.querySelector('[wized="share-success"]');
  var errorEl           = document.querySelector('[wized="share-error"]');

  var _emailOpen   = false;
  var _shareUrl    = window.location.href;
  var _recipeTitle = '';
  var _recipeUrl   = window.location.href;

  function openModal(heading, subheading, url) {
    _shareUrl = url || _recipeUrl;
    if (modalHeading)    modalHeading.textContent    = heading    || 'Share Recipe:';
    if (modalSubheading) modalSubheading.textContent = subheading || 'Share with:';
    if (modal) modal.style.setProperty('display', 'flex', 'important');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modal) modal.style.setProperty('display', 'none', 'important');
    document.body.style.overflow = '';
    resetEmail();
    hideCopyConfirm();
  }

  function showFeedback(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.setProperty('display', 'block', 'important');
    setTimeout(function() { el.style.setProperty('display', 'none', 'important'); }, 4000);
  }

  function hideCopyConfirm() {
    if (copyConfirm) copyConfirm.style.setProperty('display', 'none', 'important');
  }

  function resetEmail() {
    _emailOpen = false;
    if (emailContent)      emailContent.style.setProperty('display', 'none', 'important');
    if (emailChevron)      emailChevron.style.transform = '';
    if (emailHeader)       emailHeader.style.borderRadius = '12px';
    if (sendSomeone)       sendSomeone.checked = true;
    if (sendMyself)        sendMyself.checked  = false;
    if (emailInput)        emailInput.value = '';
    if (newsletterContent) newsletterContent.style.setProperty('display', 'none', 'important');
    if (successEl)         successEl.style.setProperty('display', 'none', 'important');
    if (errorEl)           errorEl.style.setProperty('display',   'none', 'important');
  }

  function openEmail() {
    _emailOpen = true;
    if (emailContent)      emailContent.style.setProperty('display', 'flex', 'important');
    if (emailChevron)      emailChevron.style.transform = 'rotate(180deg)';
    if (emailHeader)       emailHeader.style.borderRadius = '12px 12px 0 0';
    if (sendSomeone)       sendSomeone.checked = true;
    if (sendMyself)        sendMyself.checked  = false;
    if (newsletterContent) newsletterContent.style.setProperty('display', 'none', 'important');
  }

  function closeEmail() {
    _emailOpen = false;
    if (emailContent) emailContent.style.setProperty('display', 'none', 'important');
    if (emailChevron) emailChevron.style.transform = '';
    if (emailHeader)  emailHeader.style.borderRadius = '12px';
  }

  function buildShareUrl(platform) {
    var url   = encodeURIComponent(_shareUrl);
    var title = encodeURIComponent(_recipeTitle);
    var links = {
      pinterest: 'https://pinterest.com/pin/create/button/?url=' + url + '&description=' + title,
      facebook:  'https://www.facebook.com/sharer/sharer.php?u=' + url,
      reddit:    'https://www.reddit.com/submit?url=' + url + '&title=' + title,
      twitter:   'https://twitter.com/intent/tweet?url=' + url + '&text=' + title,
      whatsapp:  'https://wa.me/?text=' + title + '%20' + url
    };
    return links[platform] || '#';
  }

  function wireIcon(el, platform) {
    if (!el) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', function() {
      window.open(buildShareUrl(platform), '_blank', 'noopener,noreferrer');
    });
  }

  if (shareBtn) {
    shareBtn.style.cursor = 'pointer';
    shareBtn.addEventListener('click', function() { openModal('Share Recipe:', 'Share with:', _recipeUrl); });
  }

  if (closeBtn) {
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', function() { closeModal(); });
  }

  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

  wireIcon(pinterest, 'pinterest');
  wireIcon(facebook,  'facebook');
  wireIcon(reddit,    'reddit');
  wireIcon(twitter,   'twitter');
  wireIcon(whatsapp,  'whatsapp');

  if (copyLinkBtn) {
    copyLinkBtn.style.cursor = 'pointer';
    copyLinkBtn.addEventListener('click', function() {
      if (!navigator.clipboard) {
        var ta = document.createElement('textarea');
        ta.value = _shareUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } else {
        navigator.clipboard.writeText(_shareUrl);
      }
      if (copyConfirm) {
        copyConfirm.style.setProperty('display', 'flex', 'important');
        setTimeout(hideCopyConfirm, 2000);
      }
    });
  }

  if (emailHeader) {
    emailHeader.style.cursor = 'pointer';
    emailHeader.addEventListener('click', function() { if (_emailOpen) closeEmail(); else openEmail(); });
  }

  if (sendSomeone) {
    sendSomeone.addEventListener('change', function() {
      if (sendSomeone.checked) {
        if (newsletterContent) newsletterContent.style.setProperty('display', 'none', 'important');
        if (emailInput) emailInput.value = '';
      }
    });
  }

  if (sendMyself) {
    sendMyself.addEventListener('change', function() {
      if (sendMyself.checked) {
        if (newsletterContent) newsletterContent.style.setProperty('display', 'flex', 'important');
        if (_session && emailInput) {
          _supabase.from('profiles').select('email').eq('id', _session.user.id).single()
            .then(function(res) {
              if (res.data?.email && emailInput) emailInput.value = res.data.email;
            });
        }
      }
    });
  }

  if (sendBtn) {
    sendBtn.style.cursor = 'pointer';
    sendBtn.addEventListener('click', async function() {
      var email = emailInput ? emailInput.value.trim() : '';
      if (!email || !email.includes('@')) {
        showFeedback(errorEl, 'Please enter a valid email address.');
        return;
      }
      var isSelf     = sendMyself && sendMyself.checked;
      var newsletter = newsletterCb && newsletterCb.checked;
      sendBtn.style.opacity       = '0.5';
      sendBtn.style.pointerEvents = 'none';
      try {
        var { error } = await _supabase.functions.invoke('share-recipe-email', {
          body: {
            share_url:    _shareUrl,
            recipe_title: _recipeTitle,
            to_email:     email,
            send_self:    isSelf,
            newsletter:   newsletter
          }
        });
        if (error) throw error;
        showFeedback(successEl, isSelf ? 'Sent to your inbox!' : 'Shared successfully!');
        if (emailInput) emailInput.value = '';
      } catch(err) {
        showFeedback(errorEl, 'Something went wrong. Please try again.');
      } finally {
        sendBtn.style.opacity       = '';
        sendBtn.style.pointerEvents = '';
      }
    });
  }

  function wireNoteShareBtn(card) {
    var btn = card.querySelector('[wized="note-share-btn"]');
    if (!btn || btn._shareWired) return;
    btn._shareWired = true;
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', function() {
      var noteId  = card.getAttribute('data-note-id');
      var noteUrl = _recipeUrl + (noteId ? '#note-' + noteId : '');
      openModal('Share Note:', 'Share note with:', noteUrl);
    });
  }

  var shareObserver = new MutationObserver(function() {
    document.querySelectorAll('[data-note-id]').forEach(wireNoteShareBtn);
  });
  shareObserver.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll('[data-note-id]').forEach(wireNoteShareBtn);

  var checkShare = setInterval(function() {
    var recipe = window.Wized?.data?.r?.get_recipe?.data?.[0];
    if (!recipe) return;
    clearInterval(checkShare);
    _recipeTitle = recipe.recipe_title || document.title;
    _recipeUrl   = window.location.href;
  }, 200);

  setTimeout(function() { clearInterval(checkShare); }, 10000);

});
