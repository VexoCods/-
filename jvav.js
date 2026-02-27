document.addEventListener("DOMContentLoaded", () => {
    // عدد هدف رندم بین 1 تا 500,000 و ثابت
    const targetNumber = Math.floor(Math.random() * 500000) + 1;
  
    const guessInput = document.getElementById("guessInput");
    const result = document.getElementById("result");
    const buttons = document.querySelectorAll(".keypad button");
  
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const value = btn.textContent.trim();
  
        if (value === "حذف") {
          guessInput.value = guessInput.value.slice(0, -1);
          return;
        }
  
        if (value === "برسی") {
          if (!guessInput.value) return; // اگر چیزی وارد نشده کاری نکن
  
          const guess = Number(guessInput.value);
  
          if (guess < targetNumber) {
            // عدد وارد شده کمتر از هدف → High ⬆️ (یعنی بیا بالاتر)
            result.textContent = "High ⬆️";
            result.style.color = "blue";
          } else if (guess > targetNumber) {
            // عدد وارد شده بیشتر از هدف → Low ⬇️ (یعنی بیا پایین‌تر)
            result.textContent = "Low ⬇️";
            result.style.color = "red";
          } else {
            // عدد درست → قفل باز شد
            result.textContent = "قفل باز شد 🔓";
            result.style.color = "green";
          }
          return;
        }
  
        // اضافه کردن عدد به input
        guessInput.value += value;
      });
    });
  });