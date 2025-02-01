const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

async function attpCommand(sock, chatId, message) {
    const userMessage = message.message.conversation || message.message.extendedTextMessage?.text || '';
    const text = userMessage.split(' ').slice(1).join(' ');

    if (!text) {
        await sock.sendMessage(chatId, { text: 'attp කියලා ගැහුවට පස්සේ මොනා හරි ටයිප් කරලා සෙන්ඩ් කරන්න.' });
        return;
    }

    const width = 512;
    const height = 512;
    const stickerPath = path.join(__dirname, './temp', `sticker-${Date.now()}.png`);

    try {
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
        const image = new Jimp(width, height, '#FFFFFF');

        const textWidth = Jimp.measureText(font, text);
        const textHeight = Jimp.measureTextHeight(font, text, width);

        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;

        image.print(font, x, y, text, width);
        await image.writeAsync(stickerPath);

        const stickerBuffer = await sharp(stickerPath)
            .resize(512, 512, { fit: 'cover' })
            .webp()
            .toBuffer();

        await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
            mimetype: 'image/webp',
            packname: 'කස්ටම් පැක් 1', 
            author: 'Nimesh D. Bandara', 
        });

        fs.unlinkSync(stickerPath);
    } catch (error) {
        console.error('Error generating sticker:', error);
        await sock.sendMessage(chatId, { text: 'Failed to generate the sticker. Please try again later.' });
    }
}

module.exports = attpCommand;
