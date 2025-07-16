function initCaptcha() {
  hcaptcha.execute();
  
  // Проверка перед отправкой пикселя
  function beforeDraw() {
    return new Promise((resolve) => {
      hcaptcha.execute();
      hcaptcha.onSuccess(() => resolve(true));
    });
  }
}