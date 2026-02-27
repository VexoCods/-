document.addEventListener("DOMContentLoaded", () => {
  // عدد هدف رندم بین 1 تا 500,000
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
          result.textContent = "بیا بالاتر ⬆️";
          result.style.color = "blue";
        } else if (guess > targetNumber) {
          result.textContent = "بیا پایین‌تر ⬇️";
          result.style.color = "red";
        } else {
          result.textContent = "قفل باز شد 🔓";
          result.style.color = "green";
        }

        // پاک کردن ورودی بعد از بررسی
        guessInput.value = ""; 
        // (اختیاری، برای تجربه کاربری بهتر)
        // guessInput.focus(); 
        return;
      }

      // اضافه کردن عدد به input
      guessInput.value += value;
    });
  });
});
