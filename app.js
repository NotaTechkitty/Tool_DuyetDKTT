const { By, Key, Builder } = require("selenium-webdriver");
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

// FIELD
const FIELD_USERNAME = "txtUserName";
const FIELD_PASSWORD = "txtPassword";

// BUTTON
const BUTTON_SUBMIT = "DONE";

//------fUNCTION-------//

async function SignIn(driver) {
  let searchUrl = WEB_URL;
  try {
    await driver.get(searchUrl);
    await driver.findElement(By.name("txtUserName")).sendKeys(USERNAME || "");
    await driver.findElement(By.name("txtPassword")).sendKeys(PASSWORD || "");
    await driver.findElement(By.name("DONE")).click();
  } catch (e) {
    driver.close();
  }
}

async function automationFill() {
  let driver = await new Builder().forBrowser("chrome").build();

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
  //  3.1 : Kiểm tra có bao nhiêu tabs đang m
  const originalWindow = await driver.getWindowHandle();
  let lastOpenedWindow;
  let checkNumberTabs = setInterval(async () => {
    let windows = await driver.getAllWindowHandles();
    let isUser = true;

    if (windows.length > 1) {
      await driver.switchTo().window(windows[1]);
      currentWindow = await driver.getWindowHandle();
      //   if (currentWindow === lastOpenedWindow) {
      //     return;
      //   } else {
      //     lastOpenedWindow = currentWindow;
      //   }
      // Kiểm tra session còn không
      try {
        let user = await driver.findElement(By.name("txtUserName")).then((res) => {
          SignIn(driver);
        });
      } catch (e) {
        isUser = false;
      }
      // Xử lý trên trang mới
      try {
        let userID = await driver.findElement(By.id("ID_NO_New")).getAttribute("value");
        let cccdMT = await driver.findElement(By.id("cmndMT"));
        await cccdMT.click();
        let canvas = await driver.findElement(By.className("viewer-canvas"));
        let cccdImage = await canvas.findElement(By.xpath("//img"));
        cccdImage.takeScreenshot().then(function (image, err) {
          fs.writeFile("./download/savedScreen.png", image, "base64", function (err) {
            console.log(err);
          });
        });

        await cccdImage.click();

        console.log("DEBUG -->cccdMT", userID);
      } catch (e) {
        console.log("DEBUG -->error", e);

        if (!isUser) {
          //   await driver.switchTo().alert().sendKeys("Trang web không đúng");
          driver.close();
        }
      }
    }
  }, 10000);

  // run command key
  process.stdin.on("keypress", (str, key) => {
    if (key.name == "space") {
      clearInterval(checkNumberTabs);
      driver.quit();
    }
    if (key.name == "e") {
      process.exit();
    }
  });
}

//----------RUNNING-----------//
automationFill();

// let table = await driver.findElement(By.id("example"));
// let text = await table.findElement(By.xpath(".//tbody/tr/td[2]")).getText();
// let text1 = await table.findElement(By.xpath(".//tbody/tr[2]")).getText();

// if (text === lastCheckPhone) {
//   return;
// } else {
//   lastCheckPhone = text;
// }
