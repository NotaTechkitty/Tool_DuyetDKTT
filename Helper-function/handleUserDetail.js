const { By, until } = require("selenium-webdriver");

async function handleUserDetail(driver, curUser, logs) {
  let i;
  let tabs = await driver.getAllWindowHandles();
  let j = 0;
  let res = { code: "0" };
  let userName;
  let cccdNumber;
  await driver.sleep(3000);
  try {
    await driver.switchTo().window(tabs[tabs.length - 1]);

    // XỬ LÝ NVPT
    let employeeDropDown = await driver.wait(until.elementLocated(By.id("pEmployee")), 3000);
    employeeDropDown.sendKeys("C3_DANGKY");

    // XỬ LÝ TÊN KHÁCH HÀNG
    let userNameField = await driver.wait(until.elementLocated(By.id("NAME_New")), 3000).catch((e) => {
      console.log("DEBUG -->", "Không lấy được tên khách hàng", curUser);
    });
    userName = await userNameField.getAttribute("value");

    // XỬ LÝ CMND/CCCD
    try {
      let cccdNumberField = await driver.wait(until.elementLocated(By.id("ID_NO_New")), 3000);
      cccdNumber = await cccdNumberField.getAttribute("value");
      if (cccdNumber.length === 12) {
        await driver
          .findElement(By.id("ID_ISSUE_PLACE_New"))
          .sendKeys("CCC - Cục CS QLHC về trật tự xã hội")
          .catch((e) => {
            console.log("DEBUG -->", "Không chọn được nơi cấp");
          });
      }
    } catch (e) {
      console.log("DEBUG -->", "Không lấy được thông tin cccd", curUser);
    }

    // await driver.findElement(By.id("pEmployee")).sendKeys("C3_DANGKY");
    while (i !== 0 && j < 3) {
      await driver.switchTo().window(tabs[tabs.length - 1]);
      await driver.findElement(By.id("btnHistory")).click();
      i = await handleHistoryDetail(driver, res);
      j++;
    }
  } catch (e) {
    console.log("DEBUG -->", "Không nằm trong màn hình user detail");
    console.log("DEBUG -->", e?.message || e);
    return;
  }
  await driver.switchTo().window(tabs[tabs.length - 1]);

  try {
    let code = res?.code.replace(/\s/g, "");
    if (code === "0") {
      console.log("DEBUG -->", "Không lấy được thông tin đối soát ở màn hình lịch sử dịch vụ");
      return;
    }
    // Trường hợp hồ sơ vàng
    if (code == "2" && i == 0) {
      await handleApprove(driver, { name: userName, isdn: curUser }, code);
    }
    // Trường hợp hồ sơ xanh hoặc đỏ
    else {
      let message = `isdn: ${curUser}, name: ${userName} trường hợp đặc biệt không duyệt tự động`;
      logs.push(message);
      console.log(
        "DEBUG -->",
        "Trường hợp đặc biệt :",
        `Trạng thái hồ sơ : ${code}`,
        `isdn : ${curUser}`,
        `name : ${userName}`,
        "Duyệt tay"
      );
      await driver.close();
      await driver.switchTo().window(tabs[tabs.length - 2]);
    }
  } catch (e) {
    console.log("DEBUG -->", `Có lỗi khi duyệt`, { isdn: curUser, name: userName }, e);
    let message = `isdn: ${curUser}, name: ${userName} lỗi không duyệt được`;
    logs.push(message);
    return;
  }
}

module.exports = handleUserDetail;
