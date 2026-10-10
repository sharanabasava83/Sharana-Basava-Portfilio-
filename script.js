/* ==========================================================================
   SHARANABASAVA — FULL-STACK JAVA DEVELOPER PORTFOLIO
   Interactive Engine: Background Particles, Sound Effects,
   Project Inspection Modals, Skills Filter, and Contact Form.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientDustCanvas();
  initThemeAndAudio();
  initSkillsFilter();
  initBlueprintModals();
  initCredentialsModal();
  initContactDispatch();
  initCopyButtons();
  initMobileNav();
  initPrintHandlers();
});

/* ==========================================================================
   1. BACKGROUND PARTICLES ENGINE (HTML5 Canvas)
   ========================================================================== */
let dustCanvasActive = true;
let animationFrameId = null;

function initAmbientDustCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.min(width > 768 ? 20 : 10, 24);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.15,
      vy: Math.random() * -0.2 - 0.05,
      alpha: Math.random() * 0.35 + 0.1,
      pulseSpeed: Math.random() * 0.01 + 0.005
    });
  }

  function render() {
    if (!dustCanvasActive) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const isCandlelight = document.body.getAttribute('data-theme') === 'candlelight';
    const goldColor = isCandlelight ? '212, 175, 55' : '184, 134, 11';

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += Math.sin(Date.now() * 0.002 * p.pulseSpeed) * 0.01;

      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${goldColor}, ${Math.max(0.1, Math.min(p.alpha, 0.75))})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${goldColor}, 0.5)`;
      ctx.fill();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  render();

  // Particle Toggle
  const dustToggleBtn = document.getElementById('dust-toggle');
  if (dustToggleBtn) {
    dustToggleBtn.addEventListener('click', () => {
      dustCanvasActive = !dustCanvasActive;
      const label = dustToggleBtn.querySelector('.btn-label');
      if (label) {
        label.textContent = dustCanvasActive ? 'Particles: On' : 'Particles: Off';
      }
      playParchmentSound('click');
      showVintageToast(dustCanvasActive ? 'Background particles turned on.' : 'Background particles turned off.');
      if (dustCanvasActive) render();
    });
  }
}

/* ==========================================================================
   2. SOUND EFFECTS (Web Audio API)
   ========================================================================== */
let audioEnabled = false;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playParchmentSound(type = 'click') {
  if (!audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'page-flip') {
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (err) {
    console.warn('Audio note:', err);
  }
}

function initThemeAndAudio() {
  // Theme Toggle (Parchment vs Dark Mode)
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme') || 'parchment';
      const newTheme = currentTheme === 'parchment' ? 'candlelight' : 'parchment';
      document.body.setAttribute('data-theme', newTheme);

      const label = themeToggleBtn.querySelector('.btn-label');
      const icon = themeToggleBtn.querySelector('.btn-icon');
      if (newTheme === 'candlelight') {
        if (label) label.textContent = 'Light Mode';
        if (icon) icon.textContent = '☀️';
        showVintageToast('Dark Mode turned on.');
      } else {
        if (label) label.textContent = 'Dark Mode';
        if (icon) icon.textContent = '🕯️';
        showVintageToast('Light Mode turned on.');
      }
      playParchmentSound('page-flip');
    });
  }

  // Audio Toggle
  const soundToggleBtn = document.getElementById('sound-toggle');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      const label = soundToggleBtn.querySelector('.btn-label');
      if (label) {
        label.textContent = audioEnabled ? 'Sound: On' : 'Sound: Off';
      }
      if (audioEnabled) {
        getAudioContext();
        playParchmentSound('page-flip');
        showVintageToast('Sound effects turned on.');
      } else {
        showVintageToast('Sound effects muted.');
      }
    });
  }

  document.querySelectorAll('.nav-link, .wax-button').forEach(elem => {
    elem.addEventListener('mouseenter', () => playParchmentSound('click'));
  });
}

/* ==========================================================================
   3. SKILLS FILTER
   ========================================================================== */
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll('.vault-filter-btn');
  const cards = document.querySelectorAll('.arsenal-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-skill-filter');
      playParchmentSound('click');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          card.style.animation = 'modalEnter 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. PROJECT DETAILS MODALS
   ========================================================================== */
const projectBlueprints = {
  lifeflow: {
    title: 'LifeFlow — Blood Bank Management System',
    classification: 'FULL-STACK ENTERPRISE APPLICATION',
    serial: 'REF: LF-JAVA21-SPRING-2026',
    overview: 'Full-stack enterprise application built with 22 source files and 20+ RESTful API endpoints managing donor records, real-time blood inventory across 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-), and patient request workflows.',
    architectureDetails: [
      {
        heading: 'Architecture & Layered Design',
        body: 'Built on Java 21 using Spring Boot 3 with Spring Data JPA for database persistence. The system separates HTTP routing, service business rules, transaction boundaries, and entity mapping for clean maintainability.'
      },
      {
        heading: 'Emergency Priority Workflow',
        body: 'Implements request prioritization (Normal, Urgent, Emergency) with validation transitions (Approve, Fulfill, Reject). When fulfilled, blood units are automatically verified and deducted from the database.'
      },
      {
        heading: 'Responsive Single Page Application (SPA)',
        body: 'Built with HTML5, CSS3, and modern JavaScript. Features low-stock alerts, modal forms, instant search/filter across donor records, and toast notifications.'
      },
      {
        heading: 'Deployment Configuration',
        body: 'Extends SpringBootServletInitializer to support JAR and WAR deployment for Eclipse IDE and Apache Tomcat 10.1 servers.'
      }
    ],
    endpoints: [
      { method: 'POST', path: '/api/v1/donors/register', desc: 'Registers a new blood donor and validates donation eligibility' },
      { method: 'GET', path: '/api/v1/inventory/summary', desc: 'Returns real-time blood stock count across all 8 blood groups' },
      { method: 'POST', path: '/api/v1/requests/triage', desc: 'Submits patient request with priority (Normal / Urgent / Emergency)' },
      { method: 'PUT', path: '/api/v1/requests/{id}/fulfill', desc: 'Validates inventory and auto-deducts blood units upon fulfillment' },
      { method: 'GET', path: '/api/v1/alerts/low-stock', desc: 'Returns blood groups that have fallen below safe threshold limits' }
    ],
    codeSnippet: `// LifeFlow: Blood Request Fulfillment Service
@Service
@Transactional
public class BloodRequestService {
    @Autowired
    private BloodInventoryRepository inventoryRepo;
    
    public FulfillmentResult fulfillRequest(Long requestId) {
        BloodRequest request = requestRepo.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestId));
            
        BloodInventory stock = inventoryRepo.findByBloodGroup(request.getBloodGroup())
            .orElseThrow(() -> new StockUnavailableException("Blood group not found"));
            
        if (stock.getUnitsAvailable() < request.getRequestedUnits()) {
            throw new InsufficientStockException("Insufficient stock for: " + request.getBloodGroup());
        }
        
        stock.deductUnits(request.getRequestedUnits());
        request.setStatus(RequestStatus.FULFILLED);
        return new FulfillmentResult(request, stock.getUnitsAvailable());
    }
}`
  },

  ecommerce: {
    title: 'Ecommerce Management System',
    classification: 'BACKEND RESTFUL WEB SERVICES',
    serial: 'REF: ECM-SPRING-POSTMAN-2025',
    overview: 'A modular Spring Boot backend system implementing complete CRUD operations for Product catalog and Customer management using secure, stateless RESTful APIs.',
    architectureDetails: [
      {
        heading: 'Layered MVC Architecture',
        body: 'Structured into Controller, Service, and Repository layers to keep code organized, reusable, and easy to test.'
      },
      {
        heading: 'Spring Data JPA & MySQL Persistence',
        body: 'Utilized Hibernate ORM to map database tables, enforce relationships, handle pagination, and ensure data integrity in MySQL.'
      },
      {
        heading: '15+ Verified REST Endpoints',
        body: 'Tested all endpoints with Postman collections covering edge cases, query parameters, error responses, and HTTP status codes.'
      }
    ],
    endpoints: [
      { method: 'POST', path: '/api/v1/products', desc: 'Creates a new product with price, SKU, and category' },
      { method: 'GET', path: '/api/v1/products?page=0&size=10', desc: 'Retrieves paginated list of products with optional filters' },
      { method: 'GET', path: '/api/v1/products/{id}', desc: 'Fetches product details by ID' },
      { method: 'PUT', path: '/api/v1/products/{id}', desc: 'Updates product price, stock count, and description' },
      { method: 'DELETE', path: '/api/v1/products/{id}', desc: 'Deletes product record from database' }
    ],
    codeSnippet: `// Spring Boot Product Controller
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO dto) {
        ProductDTO created = productService.saveProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}`
  },

  portfolio: {
    title: 'Interactive Personal Portfolio',
    classification: 'FRONTEND & INTERACTIVE WEB DESIGN',
    serial: 'REF: PRT-CANVAS-2026',
    overview: 'A personal developer portfolio blending vintage paper textures with modern clean web design, featuring an HTML5 Canvas particle background and responsive layouts.',
    architectureDetails: [
      {
        heading: 'Canvas Particle Engine',
        body: 'Built with pure JavaScript without external libraries, rendering smooth 60 FPS floating particles.'
      },
      {
        heading: 'Clean CSS Design System',
        body: 'Uses CSS variables, procedural paper textures, responsive grid layouts, and smooth hover effects.'
      },
      {
        heading: 'Accessible Interactive Modals',
        body: 'Clean popups to inspect full project details and view resume with print support.'
      }
    ],
    endpoints: [
      { method: 'GET', path: '/index.html', desc: 'Semantic, responsive single-page portfolio' },
      { method: 'GET', path: '/style.css', desc: 'Custom property-driven vintage stylesheet' },
      { method: 'GET', path: '/script.js', desc: 'Interactive JavaScript logic and modals' }
    ],
    codeSnippet: `// Lightweight Particle Loop in JavaScript
function render() {
  ctx.clearRect(0, 0, width, height);
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < 0) p.y = height;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(184, 134, 11, ' + p.alpha + ')';
    ctx.fill();
  }
  requestAnimationFrame(render);
}`,
    repoUrl: 'https://github.com/sharanabasava83/Sharana-Basava-Portfilio-'
  }
};

function initBlueprintModals() {
  const modal = document.getElementById('dossier-modal');
  const modalContent = document.getElementById('modal-dynamic-content');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !modalContent) return;

  document.querySelectorAll('.inspect-dossier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectKey = btn.getAttribute('data-project');
      const data = projectBlueprints[projectKey];
      if (!data) return;

      playParchmentSound('page-flip');

      let endpointsHtml = '';
      if (data.endpoints && data.endpoints.length) {
        endpointsHtml = `
          <h4 class="modal-section-h4">Verified RESTful API Endpoints</h4>
          <table class="blueprint-endpoints-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint Path</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${data.endpoints
                .map(
                  ep => `
                <tr>
                  <td><span class="http-method ${ep.method.toLowerCase()}">${ep.method}</span></td>
                  <td><code>${ep.path}</code></td>
                  <td>${ep.desc}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;
      }

      let archSectionsHtml = data.architectureDetails
        .map(
          sec => `
          <div style="margin-bottom: 1.2rem;">
            <strong style="color: var(--ink-primary); font-family: var(--font-serif-title); font-size: 0.95rem;">${sec.heading}</strong>
            <p style="font-size: 0.9rem; color: var(--ink-secondary); margin-top: 0.2rem; line-height: 1.6;">${sec.body}</p>
          </div>
        `
        )
        .join('');

      let repoBtnHtml = data.repoUrl
        ? `<a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer" class="wax-button tertiary">
            <svg class="svg-btn-icon" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
            <span>GitHub Repository</span>
          </a>`
        : '';

      modalContent.innerHTML = `
        <div class="modal-blueprint-head">
          <span class="modal-tag">${data.classification} • ${data.serial}</span>
          <h2 class="modal-title">${data.title}</h2>
          <p style="font-size: 0.95rem; color: var(--ink-muted); margin-top: 0.5rem; line-height: 1.6;">${data.overview}</p>
        </div>

        <h4 class="modal-section-h4">Architecture & Technical Details</h4>
        ${archSectionsHtml}

        ${endpointsHtml}

        <h4 class="modal-section-h4">Sample Code Excerpt</h4>
        <pre class="blueprint-code-block"><code>${escapeHtml(data.codeSnippet)}</code></pre>

        <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
          ${repoBtnHtml}
          <a href="#contact" class="wax-button primary" onclick="document.getElementById('dossier-modal').classList.remove('is-active');">
            <span>Contact Regarding This Project</span>
          </a>
          <button class="wax-button secondary" onclick="window.print();">
            <span>Print Project Details</span>
          </button>
        </div>
      `;

      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    playParchmentSound('click');
  }
}

/* ==========================================================================
   5. RESUME MODAL
   ========================================================================== */
function initCredentialsModal() {
  const credModal = document.getElementById('credentials-modal');
  const openBtn = document.getElementById('open-credentials-modal-btn');
  const inspectResumeHero = document.getElementById('inspect-resume-btn');
  const closeBtn = document.getElementById('cred-modal-close-btn');
  const printDirectBtn = document.getElementById('print-resume-direct');
  const printFolioBtn = document.getElementById('print-folio');

  if (!credModal) return;

  function openCredModal() {
    credModal.classList.add('is-active');
    credModal.setAttribute('aria-hidden', 'false');
    playParchmentSound('page-flip');
  }

  function closeCredModal() {
    credModal.classList.remove('is-active');
    credModal.setAttribute('aria-hidden', 'true');
    playParchmentSound('click');
  }

  if (openBtn) openBtn.addEventListener('click', openCredModal);
  if (inspectResumeHero) inspectResumeHero.addEventListener('click', openCredModal);
  if (printFolioBtn) printFolioBtn.addEventListener('click', openCredModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCredModal);

  credModal.addEventListener('click', e => {
    if (e.target === credModal) closeCredModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && credModal.classList.contains('is-active')) {
      closeCredModal();
    }
  });

  if (printDirectBtn) {
    printDirectBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   6. CONTACT FORM HANDLER
   ========================================================================== */
function initContactDispatch() {
  const form = document.getElementById('dispatch-form');
  const statusBanner = document.getElementById('dispatch-status');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nameInput = document.getElementById('sender-name');
    const emailInput = document.getElementById('sender-email');
    const subjectInput = document.getElementById('sender-subject');
    const messageInput = document.getElementById('sender-message');

    let isValid = true;

    // Reset errors
    document.querySelectorAll('.antique-input-group').forEach(grp => grp.classList.remove('has-error'));

    if (!nameInput.value.trim()) {
      nameInput.closest('.antique-input-group').classList.add('has-error');
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
      emailInput.closest('.antique-input-group').classList.add('has-error');
      isValid = false;
    }

    if (!subjectInput.value.trim()) {
      subjectInput.closest('.antique-input-group').classList.add('has-error');
      isValid = false;
    }

    if (!messageInput.value.trim()) {
      messageInput.closest('.antique-input-group').classList.add('has-error');
      isValid = false;
    }

    if (!isValid) {
      showVintageToast('Please fill in all required fields.');
      return;
    }

    playParchmentSound('page-flip');

    // Mailto fallback
    const mailtoUrl = `mailto:sharanurs05@gmail.com?subject=${encodeURIComponent(
      subjectInput.value.trim() + ' [via Portfolio]'
    )}&body=${encodeURIComponent(
      `From: ${nameInput.value.trim()}\nEmail: ${emailInput.value.trim()}\n\nMessage:\n${messageInput.value.trim()}`
    )}`;

    if (statusBanner) {
      statusBanner.style.display = 'block';
      statusBanner.className = 'dispatch-status-banner success';
      statusBanner.innerHTML = `
        <strong>Thank you, ${nameInput.value.trim()}!</strong><br>
        Your message is prepared. Click the button below to send it directly to <code>sharanurs05@gmail.com</code>.<br><br>
        <a href="${mailtoUrl}" class="wax-button primary" style="font-size: 0.78rem; padding: 0.4rem 0.9rem; text-decoration: none;">
          <span>Send via Email Client</span>
        </a>
      `;
    }

    showVintageToast('Message ready to send!');

    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 800);
  });
}

/* ==========================================================================
   7. COPY TO CLIPBOARD
   ========================================================================== */
function initCopyButtons() {
  document.querySelectorAll('.copy-coord-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          playParchmentSound('click');
          showVintageToast(`Copied to clipboard: ${textToCopy}`);
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        })
        .catch(() => {
          showVintageToast('Unable to copy automatically.');
        });
    });
  });
}

/* ==========================================================================
   8. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('codex-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('mobile-active');
    playParchmentSound('click');
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-active');
    });
  });
}

/* ==========================================================================
   9. PRINT HANDLER
   ========================================================================== */
function initPrintHandlers() {
  const printFolioBtn = document.getElementById('print-folio');
  if (printFolioBtn) {
    printFolioBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   10. TOAST NOTIFICATIONS
   ========================================================================== */
function showVintageToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'vintage-toast';
  toast.innerHTML = `<span>⚜</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
