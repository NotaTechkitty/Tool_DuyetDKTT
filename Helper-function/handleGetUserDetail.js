const { By, until } = require("selenium-webdriver");

async function getUserDetail(driver, user, table, logs) {
  await driver
    .findElement(By.id("pIsdn"))
    .then(async (res) => {
      await res.clear();
      await res.sendKeys(user);
      await driver.findElement(By.name("btnSearch")).click();
    })
    // await isdnField.clear();
    // await isdnField.sendKeys(user);
    // await driver.findElement(By.name("btnSearch")).click();
    .catch((e) => {
      console.log("DEBUG -->", "Trường filter ISDN không nằm trong màn hình");
      return 1;
    });
  await driver.sleep(2000);
  try {
    let userDetailLink = await driver.wait(until.elementLocated(By.xpath("//table[@id='example']//tbody//tr//td[2]//a")), 3000);
    await userDetailLink.click();
    return 0;
  } catch (e) {
    let message = `isdn : ${user} đã duyệt hoặc không tồn tại trong danh sách`;
    logs.push(message);
    console.log("DEBUG -->", "Không tìm thấy user sau khi filter", e);
    return 1;
  }
}

module.exports = getUserDetail;
