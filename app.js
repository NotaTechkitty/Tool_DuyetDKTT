const { By, Key, Builder, until } = require("selenium-webdriver");
require("chromedriver");
const prompt = require("prompt-sync")();
const fs = require("fs");
require("./constants");

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
const END = "01042023";

// FIELD
const FIELD_USERNAME = "txtUserName";
const FIELD_PASSWORD = "txtPassword";

// BUTTON
const BUTTON_SUBMIT = "DONE";

// VARRIABLE
const listUser = [768484768, 905406331, 775472600, 905817098];
const timeOut = 10000;
//------fUNCTION-------//

//---------------//

//-------SIGN IN--------//

async function SignIn(driver) {
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
    console.log("DEBUG -->", "Lỗi không tìm thấy trường thông tin", e);
    return;
  }
}
//-------GET USER DETAIL--------//
async function getUserDetail(driver, user, table) {
  let isdnField = await driver.findElement(By.id("pIsdn"));
  isdnField.clear();
  isdnField.sendKeys(user);
  await driver.findElement(By.name("btnSearch")).click();
  await driver.manage().setTimeouts({ implicit: 500 });
  try {
    await driver.findElement(By.xpath("//table[@id='example']//tbody//tr//td[2]//a")).click();
    return 0;
  } catch (e) {
    console.log("DEBUG -->", "Trường thông tin user không tồn tại");
    return 1;
  }
}
//-------HANDLE USER DETAIL--------//

async function handleUserDetail(driver, curUser) {
  let i;
  let tabs = await driver.getAllWindowHandles();
  let j = 0;
  let res = { code: 1 };
  try {
    await driver.findElement(By.id("pEmployee")).sendKeys("C3_DANGKY");
    while (i !== 0 && j < 3) {
      await driver.switchTo().window(tabs[tabs.length - 1]);
      await driver.findElement(By.id("btnHistory")).click();
      i = await handleHistoryDetail(driver, res);
      j++;
    }
  } catch (e) {
    console.log("DEBUG -->", "Trường thông tin không tồn tại");
  }
  await driver.switchTo().window(tabs[tabs.length - 1]);
  // Trường hợp hồ sơ vàng
  try {
    let code = res?.code.replace(/\s/g, "");
    if (code == "2" && i == 0) {
      await handleApprove(driver);
    } else {
      console.log("DEBUG -->", "Trường hợp đặc biệt :", `Trạng thái hồ sơ : ${code}`, `isdn : ${curUser}`, "Duyệt tay");
    }
  } catch (e) {
    console.log("DEBUG -->", "Có lỗi khi duyệt", e);
  }
}
//-------HANDLE APPROVE--------//
async function handleApprove(driver, user) {
  let tabs = await driver.getAllWindowHandles();
  await driver.findElement(By.id("btnApprove")).click();
  await driver.wait(until.alertIsPresent());
  let alert = await driver.switchTo().alert();
  await alert.accept();
  console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${curUser}`, "Đã duyệt");
  await driver.close();
  await driver.switchTo().window(tabs[tabs.length - 1]);
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
      await SignIn(driver);
      await driver.close();
      return 1;
    } catch (e) {
      console.log("DEBUG -->", "Không mở được trang");
      await driver.close();
      return 2;
    }
  }
}
//-------SWITCH NEW TAB--------//

function switchToNewestTabs(driver, numTab, maxTime) {
  let i = 1;
  let checkTabs = setInterval(async function () {
    if (i === maxTime / 1000) {
      clearInterval(checkTabs);
    }
    let tabs = await driver.getAllWindowHandles();
    console.log("DEBUG -->", tabs.length);
    let newTab = tabs?.[numTab];
    if (newTab) {
      console.log("DEBUG -->", 1);
      driver.switchTo().window(newTab);
      clearInterval(checkTabs);
    }

    i++;
  }, 1000);
}

//-------AUTOMATION--------//

async function automationFill() {
  let driver = await new Builder().forBrowser("chrome").build();
  let searchUrl = WEB_URL;
  await driver.get(searchUrl);
  //   let argument = process.argv;

  // run selenium

  // step 1 : sign in
  await SignIn(driver);

  //step 2 : Chon Duyet Ho so
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
    console.log("DEBUG -->", 0);
    let tabs = await driver.getAllWindowHandles();
    let user = listUser[index];

    // await driver.switchTo().window(tabs[tabs.length - 1]);
    let flag = await getUserDetail(driver, user, table);

    // step 4 : Thực hiện duyệt khi chuyển sang tab chi tiết hồ sơ
    if (flag === 0) {
      console.log("DEBUG -->", 1);
      await driver.manage().setTimeouts({ implicit: 500 });
      await driver.switchTo().window(tabs[tabs.length - 1]);
      await handleUserDetail(driver);
    }
  }

  // run command key

  process.stdin.on("keypress", (str, key) => {
    if (key.name == "space") {
      driver.quit();
    }
    if (key.name == "e") {
      process.exit();
    }
  });
}

//----------RUNNING-----------//
automationFill();
