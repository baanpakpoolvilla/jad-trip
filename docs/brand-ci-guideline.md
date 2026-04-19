# จัดทริป — Brand & CI Guideline

> สำหรับใช้เป็น reference ในการออกแบบ UI, เว็บ, และสื่อต่างๆ

---

## 1. Brand Concept

**ชื่อ:** จัดทริป (JadTrip)  
**Tagline:** จัดได้ ไม่ยุ่งยาก  
**Positioning:** เครื่องมือสำหรับผู้จัดทริปกลุ่ม ที่ทำให้งานจัดการคน จองที่นั่ง และติดตามการจ่ายเงิน กลายเป็นเรื่องง่าย  
**Tone of voice:** ตรง กระชับ ไม่โฆษณาเกินจริง เหมือนเพื่อนที่รู้เรื่องการจัดทริปดีมาก

---

## 2. Color System

### Primary Colors

| ชื่อ | Hex | RGB | การใช้งาน |
|------|-----|-----|-----------|
| Forest Green | `#1E4D3A` | rgb(30, 77, 58) | Primary brand color, CTA หลัก, header |
| Mid Green | `#2D7A57` | rgb(45, 122, 87) | Hover state, secondary button, link |
| Light Green | `#E8F5EF` | rgb(232, 245, 239) | Background tint, badge fill, highlight |

### Neutral Colors

| ชื่อ | Hex | RGB | การใช้งาน |
|------|-----|-----|-----------|
| Gray 900 | `#1A1A1A` | rgb(26, 26, 26) | Heading, body text หลัก |
| Gray 600 | `#4A4A4A` | rgb(74, 74, 74) | Body text รอง, label |
| Gray 400 | `#888888` | rgb(136, 136, 136) | Placeholder, hint text, disabled |
| Gray 200 | `#E0E0E0` | rgb(224, 224, 224) | Border, divider |
| Gray 50  | `#F7F7F7` | rgb(247, 247, 247) | Page background, card background |
| White    | `#FFFFFF` | rgb(255, 255, 255) | Card surface, input background |

### Semantic Colors

| ชื่อ | Hex | RGB | การใช้งาน |
|------|-----|-----|-----------|
| Success Green | `#22863A` | rgb(34, 134, 58) | จ่ายแล้ว, confirmed, success state |
| Success Light | `#E6F4EA` | rgb(230, 244, 234) | Success badge background |
| Warning Amber | `#B45309` | rgb(180, 83, 9) | ใกล้ deadline, รอยืนยัน |
| Warning Light | `#FEF3C7` | rgb(254, 243, 199) | Warning badge background |
| Danger Red    | `#C0392B` | rgb(192, 57, 43) | ยังไม่จ่าย, cancelled, error |
| Danger Light  | `#FDE8E8` | rgb(253, 232, 232) | Danger badge background |
| Info Blue     | `#1A56DB` | rgb(26, 86, 219) | Link, info state |
| Info Light    | `#EBF5FF` | rgb(235, 245, 255) | Info badge background |

---

## 3. Contrast Ratios

ทุก text-on-background ผ่านมาตรฐาน WCAG AA (contrast ratio ≥ 4.5:1)

| Text | Background | Contrast Ratio | ผ่าน WCAG |
|------|-----------|----------------|-----------|
| `#FFFFFF` on `#1E4D3A` | White on Forest Green | **9.8:1** | AAA |
| `#FFFFFF` on `#2D7A57` | White on Mid Green | **5.2:1** | AA |
| `#1E4D3A` on `#E8F5EF` | Forest Green on Light Green | **6.1:1** | AA |
| `#1A1A1A` on `#FFFFFF` | Gray 900 on White | **16.8:1** | AAA |
| `#1A1A1A` on `#F7F7F7` | Gray 900 on Gray 50 | **15.4:1** | AAA |
| `#4A4A4A` on `#FFFFFF` | Gray 600 on White | **9.7:1** | AAA |
| `#888888` on `#FFFFFF` | Gray 400 on White | **3.5:1** | AA Large only |
| `#22863A` on `#E6F4EA` | Success on Success Light | **4.6:1** | AA |
| `#B45309` on `#FEF3C7` | Warning on Warning Light | **4.7:1** | AA |
| `#C0392B` on `#FDE8E8` | Danger on Danger Light | **5.1:1** | AA |
| `#1A56DB` on `#EBF5FF` | Info on Info Light | **4.8:1** | AA |

> หมายเหตุ: Gray 400 (`#888888`) ใช้เป็น placeholder/hint เท่านั้น ห้ามใช้กับ text สำคัญ

---

## 4. Typography

### Font Stack

```css
font-family: 'Noto Sans Thai', 'IBM Plex Sans Thai', 'Inter', sans-serif;
```

> ใช้ Noto Sans Thai เป็นหลักสำหรับข้อความภาษาไทย, Inter สำหรับตัวเลขและภาษาอังกฤษ

### Type Scale

| ชื่อ | Size | Weight | Line Height | การใช้งาน |
|------|------|--------|-------------|-----------|
| Display | 32px | 600 | 1.25 | Hero heading, page title |
| H1 | 26px | 600 | 1.3 | Section heading หลัก |
| H2 | 20px | 600 | 1.35 | Section heading รอง |
| H3 | 16px | 500 | 1.4 | Card title, group label |
| Body Large | 16px | 400 | 1.7 | Body text หลัก |
| Body | 14px | 400 | 1.65 | Body text ทั่วไป |
| Small | 13px | 400 | 1.5 | Caption, helper text |
| Label | 12px | 500 | 1.4 | Badge, tag, status pill |

---

## 5. Spacing System

ใช้ base unit = 4px

```
4px   — xs  (gap ระหว่าง icon กับ label)
8px   — sm  (padding ภายใน badge, gap ระหว่าง element เล็ก)
12px  — md  (gap ระหว่าง items ใน list)
16px  — lg  (padding card, gap ระหว่าง section)
24px  — xl  (padding section)
32px  — 2xl (margin ระหว่าง section ใหญ่)
48px  — 3xl (padding page top/bottom)
```

---

## 6. Border Radius

```
4px  — sm  (badge, tag, input)
8px  — md  (button, card เล็ก)
12px — lg  (card หลัก, modal)
16px — xl  (bottom sheet, large card)
9999px — full (pill button, avatar)
```

---

## 7. Component Tokens

### Button

```
Primary Button
  background:       #1E4D3A
  color:            #FFFFFF
  border:           none
  border-radius:    8px
  padding:          10px 20px
  font-size:        14px
  font-weight:      500
  hover background: #2D7A57
  active background:#164030
  disabled opacity: 0.45

Secondary Button
  background:       transparent
  color:            #1E4D3A
  border:           1.5px solid #1E4D3A
  border-radius:    8px
  padding:          10px 20px
  hover background: #E8F5EF

Ghost Button
  background:       transparent
  color:            #4A4A4A
  border:           1px solid #E0E0E0
  hover background: #F7F7F7
```

### Input / Form

```
Input
  background:       #FFFFFF
  border:           1px solid #E0E0E0
  border-radius:    8px
  padding:          10px 14px
  font-size:        14px
  color:            #1A1A1A
  placeholder:      #888888
  focus border:     #2D7A57
  focus shadow:     0 0 0 3px rgba(45,122,87,0.15)
  error border:     #C0392B
  error shadow:     0 0 0 3px rgba(192,57,43,0.12)
```

### Card

```
Card
  background:       #FFFFFF
  border:           1px solid #E0E0E0
  border-radius:    12px
  padding:          16px 20px
  shadow:           0 1px 3px rgba(0,0,0,0.06)

Card (hover)
  border:           1px solid #2D7A57
  shadow:           0 2px 8px rgba(30,77,58,0.10)
```

### Status Badge / Pill

```
confirmed / จ่ายแล้ว
  background: #E6F4EA
  color:      #22863A
  font-size:  12px
  font-weight:500
  padding:    4px 10px
  border-radius: 9999px

pending / รอยืนยัน
  background: #FEF3C7
  color:      #B45309

cancelled / ยังไม่จ่าย
  background: #FDE8E8
  color:      #C0392B

draft
  background: #F7F7F7
  color:      #4A4A4A
```

---

## 8. Seat Map Colors (รถตู้)

| สถานะ | Background | Border | Text |
|-------|-----------|--------|------|
| ว่าง (available) | `#E8F5EF` | `#2D7A57` | `#1E4D3A` |
| จองแล้ว (booked) | `#E0E0E0` | `#888888` | `#888888` |
| ที่นั่งคุณ (selected) | `#1E4D3A` | `#1E4D3A` | `#FFFFFF` |
| ไม่มีที่นั่ง (unavailable) | `#F7F7F7` | `#E0E0E0` | `#E0E0E0` |

---

## 9. Icon Style

- Style: Outline (stroke) ไม่ใช่ filled
- Stroke width: 1.5px
- Size มาตรฐาน: 16px, 20px, 24px
- Color: inherit จาก parent text color
- แนะนำ library: Lucide Icons หรือ Heroicons (outline)

---

## 10. Logo Usage

```
Logo text: จัดทริป
Font:      Noto Sans Thai, weight 700
Color (light bg): #1E4D3A
Color (dark bg):  #FFFFFF
Min size:  24px height
Clear space: 1x logo height รอบทุกด้าน
```

**ห้าม:**

- เปลี่ยนสีโลโก้นอกจากที่กำหนด
- ใช้บน background ที่ contrast ต่ำกว่า 4.5:1
- ยืด หรือบิดโลโก้

---

## 11. Dark Mode Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg-primary` | `#FFFFFF` | `#111111` |
| `--color-bg-secondary` | `#F7F7F7` | `#1C1C1C` |
| `--color-bg-tertiary` | `#F0F0F0` | `#262626` |
| `--color-text-primary` | `#1A1A1A` | `#F0F0F0` |
| `--color-text-secondary` | `#4A4A4A` | `#A0A0A0` |
| `--color-text-hint` | `#888888` | `#666666` |
| `--color-border` | `#E0E0E0` | `#333333` |
| `--color-brand` | `#1E4D3A` | `#3DAA72` |
| `--color-brand-light` | `#E8F5EF` | `#0D2E20` |

---

## 12. CSS Variables (copy-paste ready)

```css
:root {
  /* Brand */
  --color-brand:          #1E4D3A;
  --color-brand-mid:      #2D7A57;
  --color-brand-light:    #E8F5EF;

  /* Neutrals */
  --color-gray-900:       #1A1A1A;
  --color-gray-600:       #4A4A4A;
  --color-gray-400:       #888888;
  --color-gray-200:       #E0E0E0;
  --color-gray-50:        #F7F7F7;
  --color-white:          #FFFFFF;

  /* Semantic */
  --color-success:        #22863A;
  --color-success-light:  #E6F4EA;
  --color-warning:        #B45309;
  --color-warning-light:  #FEF3C7;
  --color-danger:         #C0392B;
  --color-danger-light:   #FDE8E8;
  --color-info:           #1A56DB;
  --color-info-light:     #EBF5FF;

  /* Typography */
  --font-sans: 'Noto Sans Thai', 'IBM Plex Sans Thai', 'Inter', sans-serif;

  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  12px;
  --space-lg:  16px;
  --space-xl:  24px;
  --space-2xl: 32px;
  --space-3xl: 48px;

  /* Border Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;
}
```

---

## การเชื่อมกับโค้ดโปรเจกต์

- โทเคนสีหลักถูก map เข้า Tailwind v4 ใน `src/app/globals.css` (`@theme inline`) ใช้งานเป็น `bg-brand`, `text-fg`, `border-border` ฯลฯ
- ฟอนต์โหลดผ่าน `next/font/google` ใน `src/app/layout.tsx` (Noto Sans Thai + Inter)
- คอมโพเนนต์ UI ใช้คลาสตามโทเคนนี้แทนพาเลต emerald/zinc เดิม

---

*จัดทริป Brand CI v1.0 — อัปเดตล่าสุด เมษายน 2569*
