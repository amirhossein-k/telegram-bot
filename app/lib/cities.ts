export const cities: { [provinceKey: string]: { [cityKey: string]: string } } = {
    azarbaijan_east: {
        tabriz: "تبریز",
        maragheh: "مراغه",
        marand: "مرند",
        ahar: "اهر",
        miyaneh: "میانه",
    },
    azarbaijan_west: {
        orumiyeh: "ارومیه",
        khoy: "خوی",
        mahabad: "مهاباد",
        bokan: "بوکان",
        salmas: "سلماس",
    },
    ardabil: {
        ardabil: "اردبیل",
        parsabad: "پارس‌آباد",
        meshginshahr: "مشگین‌شهر",
        khalkhal: "خلخال",
        germi: "گرمی",
    },
    esfahan: {
        esfahan: "اصفهان",
        kashan: "کاشان",
        najafabad: "نجف‌آباد",
        khomeinishahr: "خمینی‌شهر",
        shahinshahr: "شاهین‌شهر",
    },
    // ... باقی استان‌ها مشابه همین ساختار
};

export function getCityKeyboard(provinceKey: string, forSearch = false) {
    const provinceCities = cities[provinceKey] || {};
    const keys = Object.keys(provinceCities);
    const keyboard = [];

    for (let i = 0; i < keys.length; i += 2) {
        const row = [];

        row.push({
            text: provinceCities[keys[i]],
            callback_data: forSearch ? `search_city_${keys[i]}` : `profile_city_${provinceKey}_${keys[i]}`,
        });

        if (keys[i + 1]) {
            row.push({
                text: provinceCities[keys[i + 1]],
                callback_data: forSearch ? `search_city_${keys[i + 1]}` : `profile_city_${provinceKey}_${keys[i + 1]}`,
            });
        }

        keyboard.push(row);
    }

    return { reply_markup: { inline_keyboard: keyboard } };
}
