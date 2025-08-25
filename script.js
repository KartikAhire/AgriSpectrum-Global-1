/* script.js — Mumbai Agro Exports */

/* -------------------------
   Helpers & DOM selections
-------------------------*/
const sliderImgs = document.querySelectorAll('#slider .slide');
const sliderIntervalMs = 5000;

const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

const quickViewBtns = document.querySelectorAll('.quick-view');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalOrder = document.getElementById('modalOrder');
const modalClose = document.getElementById('modalClose');

const aiRecoText = document.getElementById('recoText');

const orderLinks = document.querySelectorAll('a.order');

const orderForm = document.getElementById('orderForm');
const contactForm = document.getElementById('contactAIForm');

const voiceBtn = document.getElementById('voiceBtn');
const searchInput = document.getElementById('searchInput');

const modeToggle = document.getElementById('modeToggle');
const langSelect = document.getElementById('langSelect');

const counters = document.querySelectorAll('.counter');

const typingBubble = document.getElementById('typing');
const reply1 = document.getElementById('reply1');
const reply2 = document.getElementById('reply2');

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

const yearSpan = document.getElementById('year');

/* -------------------------
   Initializations
-------------------------*/
let currentSlide = 0;
if(yearSpan) yearSpan.textContent = new Date().getFullYear();

/* -------------------------
   Slider (auto + manual)
-------------------------*/
function showSlide(idx){
  sliderImgs.forEach((img, i) => img.classList.toggle('active', i === idx));
}
function nextSlide(){
  currentSlide = (currentSlide + 1) % sliderImgs.length;
  showSlide(currentSlide);
}
let sliderTimer = setInterval(nextSlide, sliderIntervalMs);

const sliderEl = document.getElementById('slider');
if (sliderEl){
  sliderEl.addEventListener('mouseenter', ()=> clearInterval(sliderTimer));
  sliderEl.addEventListener('mouseleave', ()=> sliderTimer = setInterval(nextSlide, sliderIntervalMs));
}

/* -------------------------
   Intersection reveal & counters
-------------------------*/
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('appear');
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:0.15});
revealEls.forEach(el=> revealObserver.observe(el));

const counterObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      const target = +el.dataset.count || 0;
      let start = 0;
      const dur = 1500;
      const stepTime = Math.max(10, Math.floor(dur/target));
      const ticker = setInterval(()=>{
        start += Math.ceil(target/(dur/stepTime));
        if(start >= target){
          el.textContent = target;
          clearInterval(ticker);
        } else {
          el.textContent = start;
        }
      }, stepTime);
      counterObserver.unobserve(el);
    }
  });
},{threshold:0.6});
counters.forEach(c => counterObserver.observe(c));


/* -------------------------
   Filters
-------------------------*/
filterBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    filterProducts(filter);
  });
});

function filterProducts(filter){
  const q = (searchInput.value || '').trim().toLowerCase();
  productCards.forEach(card=>{
    const category = card.dataset.category || '';
    const name = (card.dataset.name || card.querySelector('h3')?.innerText || '').toLowerCase();
    const matchesFilter = (filter === 'all') || (category === filter);
    const matchesSearch = !q || name.includes(q);
    card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
  });
}

/* -------------------------
   Quick View Modal
-------------------------*/
quickViewBtns.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const productName = btn.dataset.product;
    const card = [...productCards].find(c=> c.dataset.name === productName);
    if(!card) return;
    const img = card.querySelector('img').src;
    const title = card.querySelector('h3').innerText;
    const desc = card.querySelector('p').innerText;

    modalImg.src = img;
    modalTitle.innerText = title;
    modalDesc.innerText = desc;

    const waMsg = `Hello, I want to order *${title}*. Please share MOQ, price, and shipping details.`;
    const waNumber = '919000000000'; // apna WhatsApp number (country code ke saath, bina +)
    modalOrder.href = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(waMsg)}`;
    modalOrder.setAttribute('target','_blank');
    modal.classList.add('active');

    updateRecommendation(title);
  });
});

modalClose.addEventListener('click', ()=> modal.classList.remove('active'));
modal.addEventListener('click', (e)=> { if(e.target === modal) modal.classList.remove('active'); });

/* -------------------------
   AI Recommendations placeholder
-------------------------*/
const recoMap = {
  "Mango (Alphonso)": ["Pomegranate", "Areca Plates (Eco)"],
  "Mango": ["Pomegranate","Turmeric Powder"],
  "Pomegranate": ["Mango (Alphonso)","Basmati Rice"],
  "Basmati Rice": ["Turmeric Powder","Areca Plates"],
  "Turmeric Powder": ["Basmati Rice","Mango (Alphonso)"],
  "Areca Plates": ["Eco Products Bundle","Turmeric Powder"]
};
function updateRecommendation(productTitle){
  let key = productTitle;
  if(!recoMap[key]){
    const found = Object.keys(recoMap).find(k => productTitle.toLowerCase().includes(k.toLowerCase()));
    if(found) key = found;
  }
  const list = recoMap[key] || [];
  if(list.length){
    aiRecoText.innerHTML = list.map(x=>`<strong>${x}</strong>`).join(' • ');
  } else {
    aiRecoText.textContent = 'No suggestions — add more to the AI map.';
  }
}

/* -------------------------
   Orders: WhatsApp & form
-------------------------*/
// const orderFormEl = document.getElementById('orderForm');
// const successMsgEl = document.getElementById('successMsg');

// orderFormEl.addEventListener('submit', (e) => {
//   e.preventDefault();

//   const fd = new FormData(orderFormEl);
//   const name = fd.get('name');
//   const email = fd.get('email');
//   const phone = fd.get('phone');
//   const product = fd.get('product');
//   const quantity = fd.get('quantity');
//   const address = fd.get('address');

//   if (!name || !email || !phone || !product || !quantity || !address) {
//     alert("Please fill in all required fields.");
//     return;
//   }

//   const waNumber = '919000000000'; // Yahan apna WhatsApp number daale (country code ke saath, bina +)
//   const message = `New Order Placed:%0AName: ${name}%0AEmail: ${email}%0APhone: ${phone}%0AProduct: ${product}%0AQuantity: ${quantity}%0AAddress: ${address}`;

//   window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${message}`, '_blank');

//   orderFormEl.reset();

//   successMsgEl.style.opacity = '1';
//   setTimeout(() => {
//     successMsgEl.style.opacity = '0';
//   }, 4000);
// });



/* -------------------------
   Contact form WhatsApp send
-------------------------*/
// if(contactForm){
//   contactForm.addEventListener('submit', (e)=>{
//     e.preventDefault();
//     const fd = new FormData(contactForm);
//     const name = fd.get('name')||'';
//     const email = fd.get('email')||'';
//     const phone = fd.get('phone')||'';
//     const message = fd.get('message')||'';
//     const waNumber = '919000000000'; 
//     const waMsg = `Contact Enquiry:%0AName: ${name}%0AEmail: ${email}%0APhone: ${phone}%0AMessage: ${message}`;
//     window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(waMsg)}`, '_blank');
//     contactForm.reset();
//     alert('Thank you — your enquiry is being prepared to send via WhatsApp.');
//   });
// }

/* -------------------------
   Voice Search (Web Speech API)
-------------------------*/
function setupVoiceSearch(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    voiceBtn.style.opacity = 0.5;
    voiceBtn.title = 'Voice search not supported in this browser';
    return;
  }
  const recog = new SpeechRecognition();
  recog.lang = 'en-IN';
  recog.interimResults = false;
  recog.maxAlternatives = 1;

  voiceBtn.addEventListener('click', ()=>{
    try{
      recog.start();
      voiceBtn.classList.add('listening');
    }catch(err){
      console.warn('Voice start error', err);
    }
  });

  recog.addEventListener('result', (evt)=>{
    const transcript = evt.results[0][0].transcript;
    searchInput.value = transcript;
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    filterProducts(activeFilter);
  });

  recog.addEventListener('end', ()=>{
    voiceBtn.classList.remove('listening');
  });
}
setupVoiceSearch();

/* -------------------------
   Search input realtime filter
-------------------------*/
searchInput && searchInput.addEventListener('input', ()=> {
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  filterProducts(activeFilter);
});

/* -------------------------
   Testimonials carousel auto
-------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const testimonials = document.querySelectorAll(".testimonial");
  const dotsContainer = document.querySelector(".dots");

  testimonials.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => showTestimonial(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".dot");
  let currentIndex = 0;

  function showTestimonial(index) {
    testimonials[currentIndex].classList.remove("active");
    dots[currentIndex].classList.remove("active");
    currentIndex = index;
    testimonials[currentIndex].classList.add("active");
    dots[currentIndex].classList.add("active");
  }

  function autoSlide() {
    let nextIndex = (currentIndex + 1) % testimonials.length;
    showTestimonial(nextIndex);
  }

  setInterval(autoSlide, 4000); // Auto change every 4 sec
});

/* -------------------------
   Dark mode toggle with persistence
-------------------------*/
if(modeToggle) {
  const storedTheme = localStorage.getItem('mumbaiAgro_theme');
  if(storedTheme === 'dark') document.body.classList.add('dark');
  modeToggle.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('mumbaiAgro_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

/* -------------------------
   Smooth scroll nav & active state
-------------------------*/
document.querySelectorAll('.nav-link').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const href = a.getAttribute('href');
    const el = document.querySelector(href);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));
    a.classList.add('active');
    if(window.innerWidth < 900){
      nav.style.display = '';
    }
  });
});

const sections = document.querySelectorAll('main .section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const id = entry.target.id;
      navLinks.forEach(lnk => {
        lnk.classList.toggle('active', lnk.getAttribute('href') === `#${id}`);
      });
    }
  });
},{threshold:0.4});
sections.forEach(sec => sectionObserver.observe(sec));

/* -------------------------
   Mobile menu toggle
-------------------------*/
menuToggle && menuToggle.addEventListener('click', () => {
  if(getComputedStyle(nav).display === 'none' || nav.style.display === ''){
    nav.style.display = 'flex';
    nav.style.flexDirection = 'column';
    nav.style.position = 'absolute';
    nav.style.right = '20px';
    nav.style.top = '60px';
    nav.style.background = 'var(--card)';
    nav.style.padding = '10px';
    nav.style.borderRadius = '8px';
    nav.style.boxShadow = 'var(--shadow)';
  } else {
    nav.style.display = '';
    nav.style.position = '';
  }
});

/* -------------------------
   Animate product cards on scroll
-------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".product-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-card");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(card => observer.observe(card));
});

/* -------------------------
   Live Chat Messages Loop
-------------------------*/
const liveMessages = [
  "🍋 Fresh Alphonso Mangoes available for export!",
  "🍇 Premium Quality Green & Black Grapes now in stock.",
  "🍌 Organic Bananas ready for shipping worldwide.",
  "🍎 Pomegranate exports with top quality assurance.",
  "🌾 Wheat (गहू) available for bulk orders.",
  "🌽 Maize / Corn (मक्का) export quality available.",
  "🌾 Bajra (बाजरी) harvested fresh for export.",
  "🌾 Jowar (ज्वारी) premium quality seeds.",
  "🧄 Garlic Powder (लसूण पावडर) ready to ship!",
  "🌶️ Chilli Powder (मिरची पावडर) export quality.",
  "🍅 Tomato Powder (टोमॅटो पावडर) in bulk stock.",
  "🌿 Moringa Powder (शेवग्याची पानं पावडर) superfood available.",
  "🍃 Eco-friendly Areca Leaf Plates & Bowls available.",
  "🥤 Sugarcane Bagasse Cups & Plates eco-friendly option.",
  "🎋 Bamboo Toothbrush & Straws – Go Green with us!"
];

const chatBox = document.getElementById("chat-box");
let msgIndex = 0;

function addMessage() {
  if (!chatBox) return;
  if (msgIndex >= liveMessages.length) msgIndex = 0;

  let msg = document.createElement("div");
  msg.classList.add("chat-message");
  msg.textContent = liveMessages[msgIndex];
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  msgIndex++;
}
setInterval(addMessage, 3000);

/* -------------------------
   Chatbot sendMessage function 
-------------------------*/
const productsDB = {
  wheat: { price: "₹30/kg", info: "High quality wheat grown by local farmers." },
  rice: { price: "₹45/kg", info: "Premium basmati rice for export and local use." },
  mango: { price: "₹120/dozen", info: "Fresh Alphonso mangoes directly from farms." }
};

function sendMessage() {
  const inputEl = document.getElementById("user-input");
  const messagesEl = document.getElementById("messages");
  if (!inputEl || !messagesEl) return;

  let input = inputEl.value.toLowerCase().trim();
  if (!input) return;

  // Show user message
  let userMsg = document.createElement("div");
  userMsg.innerHTML = `<b>You:</b> ${input}`;
  messagesEl.appendChild(userMsg);

  // Bot reply logic
  let reply = "";
  if(productsDB[input]){
    const p = productsDB[input];
    reply = `✅ Product: ${input.charAt(0).toUpperCase() + input.slice(1)}<br>💰 Price: ${p.price}<br>ℹ️ Info: ${p.info}`;
  } else if (input.includes("price")) {
    reply = "Please mention the product name (e.g., wheat, rice, mango).";
  } else {
    reply = "Sorry, I only know about Wheat, Rice, and Mango.";
  }

  let botMsg = document.createElement("div");
  botMsg.innerHTML = `<b>Bot:</b> ${reply}`;
  messagesEl.appendChild(botMsg);

  messagesEl.scrollTop = messagesEl.scrollHeight;
  inputEl.value = "";
}

//order ka opton hai 


document.getElementById('orderForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = encodeURIComponent(document.getElementById('name').value.trim());
  const email = encodeURIComponent(document.getElementById('email').value.trim());
  const product = encodeURIComponent(document.getElementById('product').value);

  if (!name || !email || !product) {
    alert('Please fill all the fields.');
    return;
  }

  // WhatsApp number with country code, replace with your company's WhatsApp number
  const whatsappNumber = '919876543210'; // Example: India +91 9876543210

  // Text message to send
  const message = `Hello, I would like to place an order.\nName: ${name}\nEmail: ${email}\nProduct: ${product}`;

  // URL encode message for WhatsApp URL
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  // Open WhatsApp chat in new tab
  window.open(whatsappURL, '_blank');
});



// order us



// Example JavaScript for simple lazy loading animation of the map section
document.addEventListener("DOMContentLoaded", () => {
  const mapWrapper = document.querySelector(".map-wrapper iframe");

  // Add a class for fade-in after iframe loads
  if (mapWrapper) {
    mapWrapper.addEventListener("load", () => {
      mapWrapper.classList.add("loaded");
    });
  }
});

