export const formatNumber = (num: string) => {
    return num.replace(/\B(?=(d{3})+(?!\d))/g, '.');
}

export class FormatCurrency {
    static VND = new Intl.NumberFormat(`vi-VN`, {
        style: 'currency',
        currency: 'VND'
    })
}