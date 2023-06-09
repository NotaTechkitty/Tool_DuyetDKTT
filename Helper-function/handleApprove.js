const { By, until } = require("selenium-webdriver");
const handleCheckLater = require("./handleCheckLater");

async function handleApprove(driver, user, code, logs) {
  let tabs = await driver.getAllWindowHandles();
  await driver.findElement(By.id("btnApprove")).click();
  await driver.wait(until.alertIsPresent());
  let alert = await driver.switchTo().alert();
  await driver.sleep(3000);
  await alert.accept();

  await driver.wait(until.alertIsPresent());
  let alert_res = await driver.switchTo().alert();
  let res_text = await alert_res.getText();

  if (res_text.includes("E000")) {
    logs.push({ ISDN: user.isdn, NAME: user.name, TYPE: 2, STATUS: "Đã Duyệt", DESCRIPTION: "" });
    console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, "Đã duyệt");
  } else if (res_text.includes("Cấm thực hiện tác động")) {
    handleCheckLater(driver, user, code, logs, "CTĐ");
  } else {
    console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, res_text);
    logs.push({ ISDN: user.isdn, NAME: user.name, TYPE: 2, STATUS: "Chưa Duyệt", DESCRIPTION: `${res_text}` });
  }
  await driver.sleep(2000);
  await alert_res.accept();
  await driver.close();
  await driver.switchTo().window(tabs[tabs.length - 2]);
}

module.exports = handleApprove;
