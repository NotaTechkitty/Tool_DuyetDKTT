const { By, Key, Builder, until } = require("selenium-webdriver");
require("chromedriver");
const prompt = require("prompt-sync")();
const fs = require("fs");

require("./constants");
const auth = require("./Helper-function/auth.js");
const helper = require("./Helper-function/function");

const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// INFO
const WEB_URL = "https://qlkh.mobifone.vn/DUYETHOSO";
const HOSO_URL = "mc_sub_lack_info.jsp";

// FIELD
const FIELD_USERNAME = "txtUserName";
const FIELD_PASSWORD = "txtPassword";

// BUTTON
const BUTTON_SUBMIT = "DONE";

// VARRIABLE
const listUser = [932543983, 775014794, 795543133];
const timeOut = 10000;
const logs = [];
//------fUNCTION-------//

//-------HANDLE USER DETAIL--------//

async function handleUserDetail(driver, curUser) {
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
      let custInfoField = await driver.findElement(By.id("infoCustomer"));
      let custInfo = await custInfoField.findElement(By.xpath(".//font")).getText();
      console.log("DEBUG -->", custInfo);
      if (custInfo.includes("Thuê bao thứ 4 trở lên cần nhập số hợp đồng")) {
        console.log("DEBUG -->", true);
      }
      // await helper.handleApprove(driver, { name: userName, isdn: curUser }, code, logs);

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
    }
  } catch (e) {
    console.log("DEBUG -->", `Có lỗi khi duyệt`, { isdn: curUser, name: userName }, e);
    let message = `isdn: ${curUser}, name: ${userName} lỗi không duyệt được`;
    logs.push(message);
    return;
  }
}

//-------HANDLE HISTORY DETAIL--------//
async function handleHistoryDetail(driver, res) {
  let tabs = await driver.getAllWindowHandles();
  await driver.switchTo().window(tabs[tabs.length - 1]);
  // await driver.manage().setTimeouts({ implicit: 500 });
  try {
    let txt = await driver.findElement(By.xpath("//p//table//tbody//tr[22]//td[2]")).getText();
    res.code = txt;
    await driver.close();
    return 0;
  } catch (e) {
    try {
      await driver.findElement(By.xpath("//input[@class='btn']")).click();
      await helper.signIn(driver);
      await driver.close();
      return 1;
    } catch (e) {
      console.log("DEBUG -->", "Không mở được trang", e);
      await driver.close();
      return 2;
    }
  }
}

//-------AUTOMATION--------//

async function automationFill() {
  const start = performance.now();
  let driver = await new Builder().forBrowser("chrome").build();
  let searchUrl = WEB_URL;

  await driver.get(searchUrl);
  //   let argument = process.argv;

  // run selenium

  // step 1 : sign in
  try {
    await helper.signIn(driver);
  } catch (e) {
    console.log("DEBUG -->", "Không thể đăng nhập website", e);
    return;
  }

  // //step 2 : Chon Duyet Ho so
  try {
    await driver.findElement(By.xpath('//a[@href="' + HOSO_URL + '"]')).click();
  } catch (e) {
    console.log("DEBUG -->", e);
  }
  // step 3: Chuyển đến chi tiết hồ sơ

  //  3.1 : Auto Filter
  helper.autoFilter(driver);

  // 3.2 : Lặp danh sách thuê bao và chuyển đến chi tiết hồ sơ

  let table = await driver.findElement(By.id("example"));
  for (let index = 0; index < listUser.length; index++) {
    console.log("DEBUG -->", index, listUser[index]);
    let tabs = await driver.getAllWindowHandles();
    let user = listUser[index];
    // await driver.switchTo().window(tabs[tabs.length - 1]);
    await driver.manage().setTimeouts({ implicit: 100 });
    let flag = await helper.handleGetUserDetail(driver, user, table, logs);

    // step 4 : Thực hiện duyệt khi chuyển sang tab chi tiết hồ sơ
    if (flag === 0) {
      // await driver.manage().setTimeouts({ implicit: 2000 });
      await handleUserDetail(driver, user);
    }
  }
  // run command key
  console.log("DEBUG -->", "DONE ALL THE LIST OF CUSTOMER");
  const end = performance.now();
  process.stdin.on("keypress", (str, key) => {
    if (key.name == "space") {
      let k = 1;
      for (message of logs) {
        console.log("DEBUG --> ", `${k}. ${message}`);
        k++;
      }
      driver.quit();
      console.log(`Execution time: ${end - start} ms`);
    }
    if (key.name == "e") {
      process.exit();
    }
  });
}

//----------RUNNING-----------//

automationFill();
