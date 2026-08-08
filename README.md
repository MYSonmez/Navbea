# Navbea Operasyon Çalışma Alanı

Bu proje standart Next.js App Router kullanır ve GitHub üzerinden Vercel'e dağıtılmaya hazırdır.

## Gereksinimler

- Node.js 22.13 veya üzeri
- npm

## Yerel geliştirme

```bash
npm ci
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde açılır.

## Yerel üretim kontrolü

```bash
npm run build
npm start
```

`npm start`, başarılı bir `npm run build` işleminden sonra standart Next.js üretim sunucusunu başlatır.

## Kontroller

```bash
npm test
npm run lint
```

## Vercel dağıtımı

1. Vercel'de **Add New → Project** seçeneğini açın.
2. `MYSonmez/Navbea` GitHub deposunu içe aktarın.
3. Framework Preset değerini **Next.js** olarak bırakın.
4. Root Directory değerini `./` olarak bırakın.
5. Build, install ve output ayarlarını değiştirmeden dağıtımı başlatın.

Proje herhangi bir ortam değişkeni gerektirmiyor. `main` dalına gönderilen değişiklikler üretim dağıtımını, diğer dallar ve pull request'ler ise önizleme dağıtımlarını tetikler.
