const provinces: Record<string, string> = {
    azarbaijan_east: "آذربایجان شرقی",
    azarbaijan_west: "آذربایجان غربی",
    ardabil: "اردبیل",
    esfahan: "اصفهان",
    alborz: "البرز",
    ilam: "ایلام",
    bushehr: "بوشهر",
    tehran: "تهران",
    chaharmahal_bakhtiari: "چهارمحال و بختیاری",
    khorasan_south: "خراسان جنوبی",
    khorasan_razavi: "خراسان رضوی",
    khorasan_north: "خراسان شمالی",
    khuzestan: "خوزستان",
    zanjan: "زنجان",
    semnan: "سمنان",
    sistan_baluchestan: "سیستان و بلوچستان",
    fars: "فارس",
    qazvin: "قزوین",
    qom: "قم",
    kordestan: "کردستان",
    kerman: "کرمان",
    kermanshah: "کرمانشاه",
    kohgiluye_boyerahmad: "کهگیلویه و بویراحمد",
    golestan: "گلستان",
    gilan: "گیلان",
    lorestan: "لرستان",
    mazandaran: "مازندران",
    markazi: "مرکزی",
    hormozgan: "هرمزگان",
    hamedan: "همدان",
    yazd: "یزد",
};

const cities: Record<string, Record<string, string>> = {
    azarbaijan_east: {
        tabriz: "تبریز",
        maragheh: "مراغه",
        marand: "مرند",
        aher: "اهر",
        mianeh: "میانه",
    },
    azarbaijan_west: {
        urmia: "ارومیه",
        khoy: "خوی",
        mahabad: "مهاباد",
        bukan: "بوکان",
        salmas: "سلماس",
    },
    ardabil: {
        ardabil: "اردبیل",
        parsabad: "پارس‌آباد",
        meshginshahr: "مشگین‌شهر",
        khalhal: "خلخال",
        germi: "گرمی",
    },
    tehran: {
        tehran: "تهران",
        shahriar: "شهریار",
        eslamshahr: "اسلامشهر",
        varamin: "ورامین",
        rey: "ری",
    },
    // سایر استان‌ها و شهرها مشابه...
};

// ساخت کیبورد تلگرام با callback_data استاندارد
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCityKeyboard = (provinceCode: any) => {
    const provinceCities = cities[provinceCode] || {};
    return {
        reply_markup: {
            inline_keyboard: Object.entries(provinceCities).map(
                ([cityCode, cityName]) => [
                    { text: cityName, callback_data: `city_${provinceCode}_${cityCode}` },
                ]
            ),
        },
    };
};

export { provinces, cities, getCityKeyboard };
