// let checkNumberTabs = setInterval(async () => {
//     let windows = await driver.getAllWindowHandles();
//     let isUser = true;

//     if (windows.length > 1) {
//       await driver.switchTo().window(windows[1]);
//       currentWindow = await driver.getWindowHandle();
//       //   if (currentWindow === lastOpenedWindow) {
//       //     return;
//       //   } else {
//       //     lastOpenedWindow = currentWindow;
//       //   }
//       // Kiểm tra session còn không
//       try {
//         let user = await driver.findElement(By.name("txtUserName")).then((res) => {
//           SignIn(driver);
//         });
//       } catch (e) {
//         isUser = false;
//       }
//       // Xử lý trên trang mới
//       try {
//         let userID = await driver.findElement(By.id("ID_NO_New")).getAttribute("value");
//         let cccdMT = await driver.findElement(By.id("cmndMT"));
//         await cccdMT.click();
//         let canvas = await driver.findElement(By.className("viewer-canvas"));
//         let cccdImage = await canvas.findElement(By.xpath("//img"));
//         cccdImage.takeScreenshot().then(function (image, err) {
//           fs.writeFile("./download/savedScreen.png", image, "base64", function (err) {
//             console.log(err);
//           });
//         });

//         await cccdImage.click();

//         console.log("DEBUG -->cccdMT", userID);
//       } catch (e) {
//         console.log("DEBUG -->error", e);

//         if (!isUser) {
//           //   await driver.switchTo().alert().sendKeys("Trang web không đúng");
//           driver.close();
//         }
//       }
//     }
//   }, 10000);

// clearInterval(checkNumberTabs);

// let table = await driver.findElement(By.id("example"));
// let text = await table.findElement(By.xpath(".//tbody/tr/td[2]")).getText();
// let text1 = await table.findElement(By.xpath(".//tbody/tr[2]")).getText();

// if (text === lastCheckPhone) {
//   return;
// } else {
//   lastCheckPhone = text;
// }
