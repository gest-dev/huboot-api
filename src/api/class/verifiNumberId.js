class VerifiNumberId {
    static formatPhoneNumber(phoneNumber) {
        // se tiver @s.whatsapp.net remove
        phoneNumber = phoneNumber.replace('@s.whatsapp.net', '');
        // Remove qualquer caractere que não seja número
        phoneNumber = phoneNumber.replace(/\D/g, '');

        // Lista de códigos DDI e DDD válidos
        const ddiList = ['55'];
        const dddList = [
            '11', '12', '13', '14', '15', '16', '17', '18', '19',
            '21', '22', '24',
            '27', '28',
            '31', '32', '33', '34', '35', '37', '38',
            '41', '42', '43', '44', '45', '46',
            '47', '48', '49',
            '51', '53', '54', '55', '56', '57', '58', '59',
            '61',
            '62', '64',
            '63',
            '65', '66',
            '67',
            '68',
            '69',
            '71', '73', '74', '75', '77',
            '79',
            '81', '87',
            '82',
            '83',
            '84',
            '85', '88',
            '86', '89',
            '91', '93', '94',
            '92', '97',
            '95',
            '96',
            '98', '99'
        ];

        // Verifica se tem exatamente 13 dígitos
        if (phoneNumber.length !== 13) {
            return null;
        }

        // Verifica DDI
        const ddi = phoneNumber.slice(0, 2);
        if (!ddiList.includes(ddi)) {
            return null;
        }

        // Verifica DDD
        const ddd = phoneNumber.slice(2, 4);
        if (!dddList.includes(ddd)) {
            return null;
        }

        // Verifica se o número começa com 9 (após DDI e DDD)
        const firstDigitAfterDdd = phoneNumber.charAt(4);
        if (firstDigitAfterDdd !== '9') {
            return null;
        }

        return phoneNumber;
    }

    static testFormatGroupId(groupId) {
        // verifica se o grupo tem o formato 120363324939242591@g.us conter @g.us e ter no maximo 40 caracteres
        if (groupId.endsWith('@g.us') && groupId.length <= 40 && groupId.length > 5) {
            return groupId;
        } else {
            return null;
        }
    }

}

export default VerifiNumberId;
