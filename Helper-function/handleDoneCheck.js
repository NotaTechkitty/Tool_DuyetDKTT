// const def_mode = {
//   approve: "APPROVE",
//   dismiss: "DISMISS",
//   check_later: "CHECK_LATER",
// };

// async function handleDone(mode) {
//   if (res_text.includes("E000")) {
//     logs.push({ ISDN: user.isdn, NAME: user.name, TYPE: 2, STATUS: "Đã Duyệt", DESCRIPTION: "" });
//     console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, "Đã duyệt");

//     await driver.close();
//     await driver.switchTo().window(tabs[tabs.length - 2]);
//   } else if (res_text.includes("Cấm thực hiện tác động")) {
//     handleCheckLater(driver, user, code, logs, "CTĐ");
//     console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, "Duyệt sau");

//     await driver.close();
//     await driver.switchTo().window(tabs[tabs.length - 2]);
//   } else {
//     console.log("DEBUG -->", `Trạng thái hồ sơ : ${code}`, `isdn : ${user.isdn} name : ${user.name}`, res_text);

//     logs.push({ ISDN: user.isdn, NAME: user.name, TYPE: 2, STATUS: "Chưa Duyệt", DESCRIPTION: `${res_text}` });

//     await driver.close();
//     await driver.switchTo().window(tabs[tabs.length - 2]);
//   }
// }
