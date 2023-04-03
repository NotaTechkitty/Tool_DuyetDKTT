const { By, until } = require("selenium-webdriver");

async function handleApprove(driver, user, code, logs) {
  let tabs = await driver.getAllWindowHandles();
  await driver.findElement(By.id("btnApprove")).click();
  await driver.wait(until.alertIsPresent());
  let alert = await driver.switchTo().alert();
  await alert.accept();

  await driver.wait(until.alertIsPresent());
  let alert_res = await driver.switchTo().alert();
  let res_text = await alert_res.getText();
  await alert_res.accept();
  if (res_text.includes("E000")) {
    logs.push({ ISDN: user.isdn, NAME: user.name, TYPE: 2, STATUS: "Đã Duyệt", DESCRIPTION: "" });
    console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, "Đã duyệt");

    await driver.close();
    await driver.switchTo().window(tabs[tabs.length - 2]);
  } else {
    console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, res_text);

    logs.push({ ISDN: user.isdn, NAME: user.name, TYPE: 2, STATUS: "Chưa Duyệt", DESCRIPTION: `${res_text}` });

    await driver.close();
    await driver.switchTo().window(tabs[tabs.length - 2]);
  }
}

module.exports = handleApprove;
