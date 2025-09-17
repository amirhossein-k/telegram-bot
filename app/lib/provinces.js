// // app\lib\provinces.js
// const provinces = [
//   { name: "آذربایجان شرقی", callback: "province_آذربایجان_شرقی" },
//   { name: "آذربایجان غربی", callback: "province_آذربایجان_غربی" },
//   { name: "اردبیل", callback: "province_اردبیل" },
//   { name: "اصفهان", callback: "province_اصفهان" },
//   { name: "البرز", callback: "province_البرز" },
//   { name: "ایلام", callback: "province_ایلام" },
//   { name: "بوشهر", callback: "province_بوشهر" },
//   { name: "تهران", callback: "province_تهران" },
//   { name: "چهارمحال و بختیاری", callback: "province_چهارمحال_و_بختیاری" },
//   { name: "خراسان جنوبی", callback: "province_خراسان_جنوبی" },
//   { name: "خراسان رضوی", callback: "province_خراسان_رضوی" },
//   { name: "خراسان شمالی", callback: "province_خراسان_شمالی" },
//   { name: "خوزستان", callback: "province_خوزستان" },
//   { name: "زنجان", callback: "province_زنجان" },
//   { name: "سمنان", callback: "province_سمنان" },
//   { name: "سیستان و بلوچستان", callback: "province_سیستان_و_بلوچستان" },
//   { name: "فارس", callback: "province_فارس" },
//   { name: "قزوین", callback: "province_قزوین" },
//   { name: "قم", callback: "province_قم" },
//   { name: "کردستان", callback: "province_کردستان" },
//   { name: "کرمان", callback: "province_کرمان" },
//   { name: "کرمانشاه", callback: "province_کرمانشاه" },
//   { name: "کهگیلویه و بویراحمد", callback: "province_کهگیلویه_و_بویراحمد" },
//   { name: "گلستان", callback: "province_گلستان" },
//   { name: "گیلان", callback: "province_گیلان" },
//   { name: "لرستان", callback: "province_لرستان" },
//   { name: "مازندران", callback: "province_مازندران" },
//   { name: "مرکزی", callback: "province_مرکزی" },
//   { name: "هرمزگان", callback: "province_هرمزگان" },
//   { name: "همدان", callback: "province_همدان" },
//   { name: "یزد", callback: "province_یزد" },
// ];

// const getProvinceKeyboard = () => {
//   return {
//     reply_markup: {
//       inline_keyboard: provinces.map((province) => [
//         { text: province.name, callback_data: province.callback },
//       ]),
//     },
//   };
// };

// export { provinces, getProvinceKeyboard };

// app\lib\provinces.js
const provinces = [
  { name: "آذربایجان شرقی" },
  { name: "آذربایجان غربی" },
  { name: "اردبیل" },
  { name: "اصفهان" },
  { name: "البرز" },
  { name: "ایلام" },
  { name: "بوشهر" },
  { name: "تهران" },
  { name: "چهارمحال و بختیاری" },
  { name: "خراسان جنوبی" },
  { name: "خراسان رضوی" },
  { name: "خراسان شمالی" },
  { name: "خوزستان" },
  { name: "زنجان" },
  { name: "سمنان" },
  { name: "سیستان و بلوچستان" },
  { name: "فارس" },
  { name: "قزوین" },
  { name: "قم" },
  { name: "کردستان" },
  { name: "کرمان" },
  { name: "کرمانشاه" },
  { name: "کهگیلویه و بویراحمد" },
  { name: "گلستان" },
  { name: "گیلان" },
  { name: "لرستان" },
  { name: "مازندران" },
  { name: "مرکزی" },
  { name: "هرمزگان" },
  { name: "همدان" },
  { name: "یزد" },
];
const getProvinceKeyboard = (forSearch = false) => {
  return {
    reply_markup: {
      inline_keyboard: provinces.map((province) => {
        const province_callback_data = province.name.replace(/ /g, "_");
        return [
          {
            text: province.name,
            callback_data: forSearch
              ? `search_province_${province_callback_data}`
              : `profile_province_${province_callback_data}`, // Corrected prefix for profile creation
          },
        ];
      }),
    },
  };
};

export { provinces, getProvinceKeyboard };
