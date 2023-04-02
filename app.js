const { By, Key, Builder, until } = require("selenium-webdriver");
require("chromedriver");
const prompt = require("prompt-sync")();
const fs = require("fs");

require("./constants");
const auth = require("./Helper-function/auth.js");

const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// INFO
const WEB_URL = "https://qlkh.mobifone.vn/DUYETHOSO";
const HOSO_URL = "mc_sub_lack_info.jsp";

const USERNAME = "C3_THIENLMN";
const PASSWORD = "abcd@1234";

const PROVINCE = "QNA";
const DISTRICT = "TKY";
const sDS = "Tất cả";

const START = "01032023";
const END = "02042023";

// FIELD
const FIELD_USERNAME = "txtUserName";
const FIELD_PASSWORD = "txtPassword";

// BUTTON
const BUTTON_SUBMIT = "DONE";

// VARRIABLE
const listUser = [788632641, 931447819];
const timeOut = 10000;
const logs = [];
//------fUNCTION-------//

//---------------//

//-------SIGN IN--------//

async function signIn(driver) {
  try {
    await driver.findElement(By.name("txtUserName")).sendKeys(USERNAME || "");
    await driver.findElement(By.name("txtPassword")).sendKeys(PASSWORD || "");
    await driver.findElement(By.name("DONE")).click();
  } catch (e) {
    driver.close();
  }
}

//--------AUTO FILTER-------//
async function AutoFilter(driver) {
  try {
    // Chọn Tỉnh
    await driver.findElement(By.id("pProvince")).sendKeys(PROVINCE);

    //Chọn Danh sách
    await driver.findElement(By.id("pDS")).sendKeys(sDS);

    // Chọn ngày bắt đầu
    await driver.findElement(By.id("pfromDate")).sendKeys(START);

    // Chọn ngày kết thúc
    await driver.findElement(By.id("pToDate")).sendKeys(END);

    await driver.manage().setTimeouts({ implicit: 100 });
    // Chọn Huyện
    await driver.findElement(By.id("pDistrict")).sendKeys(DISTRICT);
  } catch (e) {
    console.log("DEBUG -->", "Lỗi không tìm thấy trường thông tin trong filter", e);
    return;
  }
}
//-------GET USER DETAIL--------//
async function getUserDetail(driver, user, table) {
  await driver
    .findElement(By.id("pIsdn"))
    .then(async (res) => {
      await res.clear();
      await res.sendKeys(user);
      await driver
        .findElement(By.name("btnSearch"))
        .click()
        .then(() => {
          console.log("DEBUG -->", 1);
        });
    })
    // await isdnField.clear();
    // await isdnField.sendKeys(user);
    // await driver.findElement(By.name("btnSearch")).click();
    .catch((e) => {
      console.log("DEBUG -->", "Trường filter ISDN không nằm trong màn hình");
      return 1;
    });

  try {
    await driver
      .wait(until.elementLocated(By.xpath("//table[@id='example']//tbody//tr//td[2]//a")), 3000)
      .then(async (res) => {
        await driver
          .wait(async () => {
            let isdnTxt = await res.findElement(By.xpath(".//font")).getText();
            console.log("DEBUG -->", isdnTxt, user);
            return +isdnTxt === user;
          }, 3000)
          .catch((e) => {
            console.log("DEBUG -->", "Không thể thay đổi dữ liệu");
          });

        // console.log("DEBUG -->", isdnTxt, user);
        await res.click().then(() => {
          console.log("DEBUG -->", 2);
        });
      });

    // await userData.click().then(() => {
    //   console.log("DEBUG -->", 2);
    // });
    // await driver.manage().setTimeouts({ implicit: 2000 });
    return 0;
  } catch (e) {
    let message = `isdn : ${user} đã duyệt hoặc không tồn tại trong danh sách`;
    logs.push(message);
    console.log("DEBUG -->", "Không tìm thấy user sau khi filter", e);
    return 1;
  }
}
//-------HANDLE USER DETAIL--------//

async function handleUserDetail(driver, curUser) {
  let i;
  let tabs = await driver.getAllWindowHandles();
  let j = 0;
  let res = { code: "0" };
  let userName;
  let cccdNumber;
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
          .sendKeys("CCC")
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
//-------HANDLE APPROVE--------//
async function handleApprove(driver, user, code) {
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
    console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, "Đã duyệt");
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
      await signIn(driver);
      await driver.close();
      return 1;
    } catch (e) {
      console.log("DEBUG -->", "Không mở được trang");
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
    await signIn(driver);
  } catch (e) {
    console.log("DEBUG -->", "Không thể đăng nhập website");
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
  AutoFilter(driver);

  // 3.2 : Lặp danh sách thuê bao và chuyển đến chi tiết hồ sơ

  let table = await driver.findElement(By.id("example"));
  for (let index = 0; index < listUser.length; index++) {
    console.log("DEBUG -->", index, listUser[index]);
    let tabs = await driver.getAllWindowHandles();
    let user = listUser[index];
    // await driver.switchTo().window(tabs[tabs.length - 1]);
    await driver.manage().setTimeouts({ implicit: 100 });
    let flag = await getUserDetail(driver, user, table);

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
