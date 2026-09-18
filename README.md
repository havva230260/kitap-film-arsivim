# Kitap & Film Arşivim

Okuduğun kitapları, izlediğin film ve dizileri tek bir yerde toplayan, kişisel arşiv tutmana yardımcı olan bir mobil uygulama. Her kaydına puan verebilir, favorilerine ekleyebilir, alıntı/özet/düşüncelerini not düşebilir ve zamanla biriken arşivini istatistiklerle görebilirsin.

## Özellikler

- **Kayıt / giriş** — e-posta ve şifre ile hesap oluşturma ve giriş (Supabase Auth)
- **Kitap ekleme** — başlık, yazar, tür, puan, başlangıç/bitiş tarihi, okuma kolaylığı, sevdiğin alıntı, özet, düşünceler, kapak görseli
- **Film / dizi ekleme** — başlık, yönetmen/yaratıcı, tür, puan, izleme tarihi (film) ya da başlangıç tarihi + durum + sezon durumu (dizi), akılda kalan sahne, afiş görseli
- **Detay ve düzenleme** — her kaydı görüntüleme, düzenleme ve silme; favori ve puanı doğrudan detay ekranından değiştirebilme
- **Favoriler** — kalp ile işaretlenen kitap/film/dizileri tek listede görme
- **Puanlama** — 1-10 arası puanlama, arşiv genelinde ortalama puan hesaplama
- **İstatistikler** — kaç kitap/film/dizi eklendiği, ortalama puan, favori sayısı
- **Arama ve süzme** — başlığa göre arama, türe ve minimum puana göre süzme
- **Açık/koyu tema** — sistem temasına otomatik uyum

## Kullanılan teknolojiler

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (Expo Router ile dosya tabanlı yönlendirme)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) — Postgres veritabanı, kimlik doğrulama, Row Level Security
- React Native Reanimated / Gesture Handler, Expo Image gibi Expo ekosistemi kütüphaneleri

## Kurulum

1. **Bağımlılıkları yükle**

   ```bash
   npm install
   ```

2. **Supabase projesini hazırla**

   [supabase.com](https://supabase.com) üzerinde bir proje oluştur, ardından `supabase/schema.sql` dosyasının tamamını Supabase Dashboard > SQL Editor içinde çalıştır. Bu dosya tabloları, indexleri ve Row Level Security politikalarını (her kullanıcı yalnızca kendi kayıtlarını görür/düzenler) oluşturur.

3. **Ortam değişkenlerini ayarla**

   `.env.example` dosyasını `.env` olarak kopyala ve Supabase proje ayarlarındaki (Project Settings > API) URL ve anon key değerleriyle doldur:

   ```bash
   cp .env.example .env
   ```

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=xxxxxxxx
   ```

4. **Uygulamayı başlat**

   ```bash
   npx expo start
   ```

   Çıktıda beliren QR kodu Expo Go ile okutabilir ya da Android/iOS emülatöründe açabilirsin.

## Proje yapısı

```
src/
├── app/                  # Expo Router ekranları (dosya tabanlı yönlendirme)
│   ├── (app)/            # Giriş yapmış kullanıcının sekmeleri: Arşiv, Favoriler, İstatistik
│   ├── item/[id].tsx     # Kayıt detay / düzenleme / silme ekranı
│   ├── add.tsx           # Yeni kitap / film / dizi ekleme formu
│   ├── sign-in.tsx       # Giriş / kayıt ol ekranı
│   └── _layout.tsx       # Kök yönlendirme + oturum koruması
├── components/
│   ├── archive/          # Arşiv listesi kartı ve süzgeç paneli
│   └── ui/               # Paylaşılan tasarım sistemi bileşenleri (buton, text field, rating vb.)
├── lib/
│   ├── supabase.ts       # Supabase istemcisi
│   ├── auth.tsx          # Kimlik doğrulama context'i
│   ├── archive.ts        # Arşiv verisini çeken hook + form yardımcıları
│   └── types.ts          # Veritabanı tablolarına karşılık gelen tipler
├── hooks/                # Tema ve renk şeması hook'ları
└── constants/theme.ts    # Renk paleti, tipografi, boşluk ölçeği

supabase/
└── schema.sql            # Tablolar, indexler ve RLS politikaları
```

## Ekran görüntüleri

_(Yakında eklenecek)_

<!--
| Arşiv | Detay | İstatistik |
|---|---|---|
| ![Arşiv](docs/screenshots/archive.png) | ![Detay](docs/screenshots/detail.png) | ![İstatistik](docs/screenshots/stats.png) |
-->
