/* eslint-disable no-unsafe-optional-chaining */

class VerifiNumberId {
    static formatPhoneNumber(phoneNumber) {

        // Lista de códigos DDI e DDD válidos
        const ddiList = ['55']; // Adicione outros códigos DDI conforme necessário
        const dddList = [
            '11', '12', '13', '14', '15', '16', '17', '18', '19', // São Paulo e Grande São Paulo (SP)
            '21', '22', '24', // Rio de Janeiro (RJ)
            '27', '28', // Espírito Santo (ES)
            '31', '32', '33', '34', '35', '37', '38', // Minas Gerais (MG)
            '41', '42', '43', '44', '45', '46', // Paraná (PR)
            '47', '48', '49', // Santa Catarina (SC)
            '51', '53', '54', '55', '56', '57', '58', '59', // Rio Grande do Sul (RS)
            '61', // Distrito Federal (DF)
            '62', '64', // Goiás (GO)
            '63', // Tocantins (TO)
            '65', '66', // Mato Grosso (MT)
            '67', // Mato Grosso do Sul (MS)
            '68', // Acre (AC)
            '69', // Rondônia (RO)
            '71', '73', '74', '75', '77', // Bahia (BA)
            '79', // Sergipe (SE)
            '81', '87', // Pernambuco (PE)
            '82', // Alagoas (AL)
            '83', // Paraíba (PB)
            '84', // Rio Grande do Norte (RN)
            '85', '88', // Ceará (CE)
            '86', '89', // Piauí (PI)
            '91', '93', '94', // Pará (PA)
            '92', '97', // Amazonas (AM)
            '95', // Roraima (RR)
            '96', // Amapá (AP)
            '98', '99' // Maranhão (MA)
        ];

        // Verifica se os dois primeiros dígitos estão na lista de códigos DDI válidos
        const ddi = phoneNumber.slice(0, 2);
        if (!ddiList.includes(ddi)) {
            // Se o DDI não for válido, retorna null
            return null;
        }

        // Verifica se os próximos dígitos correspondem a um DDD válido
        const ddd = phoneNumber.slice(2, 4);
        if (!dddList.includes(ddd)) {
            // Se o DDD não for válido, retorna null
            return null;
        }

        //verificar se tem 13 ou 14 digitos se não seguir essa norma retorna null
        if (phoneNumber.length < 13 || phoneNumber.length > 14) {
            return null;
        }

        // Remove qualquer caracter não numérico do número de telefone
        phoneNumber = `${phoneNumber.replace(/\D/g, '')}`;

        // Verifica se o número de telefone tem 13 dígitos (incluindo o nono dígito) e se o terceiro dígito é "9"
        if (phoneNumber.length === 13) {
            // Remove o nono dígito (índice 2)
            // Remove a letra na posição especificada da phoneNumber
            phoneNumber = phoneNumber.substring(0, 4) + phoneNumber.substring(4 + 1);
        }

        // Retorna o número de telefone formatado
        return phoneNumber;


    }
}

exports.VerifiNumberId = VerifiNumberId
