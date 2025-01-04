export default {
    mounted(el, binding) {
      const options = binding.value || {
        threshold: 0.1,
        hiddenClasses: "opacity-0 translate-y-6",
        visibleClasses: "opacity-100 translate-y-0",
        transitionClasses: "transition-opacity transition-transform duration-700 ease-out",
      };
  
      // Initial hidden state
      el.classList.add(...options.hiddenClasses.split(" "), ...options.transitionClasses.split(" "));
  
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Add visible classes and remove hidden classes
              el.classList.add(...options.visibleClasses.split(" "));
              el.classList.remove(...options.hiddenClasses.split(" "));
            }
          });
        },
        { threshold: options.threshold }
      );
  
      observer.observe(el);
    },
  };
  