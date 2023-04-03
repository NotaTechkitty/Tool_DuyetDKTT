const { By, until } = require("selenium-webdriver");

async function handleDismiss(driver, user, code, logs, note) {
  let tabs = await driver.getAllWindowHandles();
  await driver.findElement(By.id("pDescription")).sendKeys(note || "");
  await driver.sleep(500);
  await driver.findElement(By.id("btnCancel")).click();
  await driver.wait(until.alertIsPresent());
  let alert = await driver.switchTo().alert();
  await alert.accept();

  await driver.wait(until.alertIsPresent());
  let alert_res = await driver.switchTo().alert();
  let res_text = await alert_res.getText();
  await alert_res.accept();
  if (res_text.includes("E000")) {
    console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, `Đã hủy với lý do ${note}`);
    let message = `isdn: ${user.isdn}, name: ${user.name} dã duyệt`;
    logs.push(message);
    await driver.close();
    await driver.switchTo().window(tabs[tabs.length - 2]);
  } else {
    console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, res_text);
    let message = `isdn: ${user.isdn}, name: ${user.name} ${res_text}`;
    logs.push(message);
    await driver.close();
    await driver.switchTo().window(tabs[tabs.length - 2]);
  }
}

module.exports = handleDismiss;
