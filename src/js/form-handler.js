const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
const button = form.querySelector("button");

// Form validation patterns
const patterns = {
  name: /^[a-zA-Z\s]{2,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: /^[\s\S]{10,500}$/
};

// Add form groups and error messages
const inputs = form.querySelectorAll('input, textarea');
inputs.forEach(input => {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  
  const error = document.createElement('div');
  error.className = 'error-message';
  wrapper.appendChild(error);
  
  // Set validation pattern
  if (patterns[input.name]) {
    input.pattern = patterns[input.name].source;
  }
  
  // Add validation on input
  input.addEventListener('input', () => {
    validateField(input, error);
  });
});

function validateField(input, error) {
  const pattern = patterns[input.name];
  if (!pattern) return true;
  
  const isValid = pattern.test(input.value);
  input.setCustomValidity(isValid ? '' : 'Invalid input');
  
  if (!isValid) {
    switch(input.name) {
      case 'name':
        error.textContent = 'Please enter a valid name (2-50 characters)';
        break;
      case 'email':
        error.textContent = 'Please enter a valid email address';
        break;
      case 'message':
        error.textContent = 'Message must be between 10 and 500 characters';
        break;
    }
  } else {
    error.textContent = '';
  }
  
  return isValid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate all fields
  const formGroups = form.querySelectorAll('.form-group');
  let isValid = true;
  
  formGroups.forEach(group => {
    const input = group.querySelector('input, textarea');
    const error = group.querySelector('.error-message');
    if (!validateField(input, error)) {
      isValid = false;
    }
  });

  if (!isValid) return;

  const data = new FormData(form);

  // Show loading state
  button.disabled = true;
  button.innerHTML = `<span class="spinner"></span> Sending...`;
  status.textContent = "";
  form.classList.add('loading');

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json"
      }
    });

    if (response.ok) {
      form.reset();
      status.textContent = "✅ Message sent successfully!";
      status.style.color = "green";
      
      // Clear error messages
      formGroups.forEach(group => {
        const error = group.querySelector('.error-message');
        error.textContent = '';
      });
    } else {
      const result = await response.json();
      if (result.errors) {
        status.textContent = result.errors.map(error => error.message).join(", ");
      } else {
        status.textContent = "Something went wrong. Please try again.";
      }
      status.style.color = "red";
    }
  } catch (error) {
    status.textContent = "Network error. Please try again later.";
    status.style.color = "red";
  }

  // Reset button and loading state
  button.disabled = false;
  button.innerHTML = "Send Message";
  form.classList.remove('loading');

  // Clear status message after 5 seconds
  setTimeout(() => {
    status.textContent = "";
  }, 5000);
});
