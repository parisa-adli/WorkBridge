import { HiArrowLeft } from "react-icons/hi";
import MainHeader from "../ui/MainHeader";
import { toPersianNumbers } from "../utils/toPersianNumber";
import {
  FaInstagram,
  FaTelegramPlane,
  FaLinkedin,
  FaMailBulk,
} from "react-icons/fa";

const categories = [
  {
    id: 1,
    title: "برنامه نویسی",
    skills: 985,
    image_url: "Images/categories/development.svg",
  },
  {
    id: 2,
    title: "طراحی و خلاقیت",
    skills: 515,
    image_url: "Images/categories/design.svg",
  },
  {
    id: 3,
    title: "بازاریابی دیجیتال",
    skills: 486,
    image_url: "Images/categories/marketing.svg",
  },
  {
    id: 4,
    title: "نویسندگی و ترجمه",
    skills: 1118,
    image_url: "Images/categories/writing.svg",
  },
  {
    id: 5,
    title: "موسیقی و ویدئو",
    skills: 567,
    image_url: "Images/categories/music.svg",
  },
  {
    id: 6,
    title: "ویدئو و انیمیشن",
    skills: 231,
    image_url: "Images/categories/video.svg",
  },
  {
    id: 7,
    title: "طراحی معماری",
    skills: 732,
    image_url: "Images/categories/Architecture.svg",
  },
  {
    id: 8,
    title: "مالی و حسابداری",
    skills: 963,
    image_url: "Images/categories/Finance.svg",
  },
];
const Achievement = [
  {
    id: 1,
    title: "فریلنسرها",
    numbers: 7423,
    image_url: "Images/freelancer.svg",
  },
  {
    id: 2,
    title: "پروژه های ثبت شده",
    numbers: 8325,
    image_url: "Images/projects.svg",
  },
  {
    id: 3,
    title: "پروژه های تکمیل شده",
    numbers: 6274,
    image_url: "Images/completed.svg",
  },
  {
    id: 4,
    title: "شرکت های ثبت شده",
    numbers: 3560,
    image_url: "Images/companies.svg",
  },
];
const BORDER_COLORS = {
  1: "border-t-[#FFDB7D]",
  2: "border-t-[#FFDAD3]",
  3: "border-t-[#D0E1FF]",
  4: "border-t-[#DAF3E1]",
};

function Home() {
  return (
    <div className="bg-secondary-0">
      <MainHeader />
      <div className="bg-primary-100 w-full">
        <div className="container xl:max-w-screen-lg">
          <div className="p-4 text-xl text-gray-700 grid grid-cols-1 md:grid-cols-[1fr_2fr] md:gap-x-8">
            <div className="space-y-4 md:space-y-8 my-4 md:mt-10">
              <div>
                <h1 className="font-extrabold text-3xl md:text-5xl ">
                  فریلنسر اپ
                </h1>
                <h3 className="mt-3 text-xl md:text-3xl font-bold text-primary-900 sm:text-nowrap">
                  پلتفرمی برای کارفرما و فریلنسر
                </h3>
              </div>
              <p className="text-justify leading-relaxed text-sm md:text-lg">
                پلتفرمی هوشمند برای اتصال کارفرماها و فریلنسرها در دنیای پرسرعت
                امروز، ما بستری فراهم کرده‌ایم که کارفرماها بتوانند پروژه‌های
                خود را با چند کلیک تعریف کنند و فریلنسرهای متخصص، دقیق و متعهد
                آن‌ها را اجرا کنند. از ثبت درخواست تا تحویل نهایی، همه چیز ساده،
                شفاف و قابل پیگیری است.
              </p>
            </div>
            <div className="max-w-xl mt-8">
              <img src="Images/freelancer.png" alt="freelancer-home" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-8 mx-auto text-center space-y-2">
        <p className="md:text-2xl font-bold text-secondary-900">
          دسته بندی های محبوب
        </p>
        <p className="text-xs md:text-lg text-secondary-500">
          از میان بیش از ۱۳۰۰ مهارت حرفه‌ای انتخاب کن
        </p>
        <section className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 pt-8 gap-5">
          {categories.map((category) => (
            <div className="grid grid-cols-4 items-center p-3 border rounded-lg  gap-x-2">
              <div className="col-span-1 aspect-square shrink-0  min-w-10">
                <img
                  className="object-contain w-full h-full"
                  src={category.image_url}
                  alt={category.title}
                />
              </div>
              <p className="col-span-3 flex flex-col items-start gap-2 text-nowrap text-sm lg:text-lg text-secondary-800">
                {category.title}
                <span className="flex items-center gap-x-2 text-secondary-400 text-xs ">
                  {toPersianNumbers(category.skills)} پروژه <HiArrowLeft />
                </span>
              </p>
            </div>
          ))}
        </section>
      </div>
      <div
        className="lg:p-8 flex gap-4
    overflow-x-auto
    scroll-smooth
    snap-x snap-mandatory
    pb-4
  lg:grid lg:grid-cols-2 lg:gap-6
    lg:overflow-visible"
      >
        <div
          className="    snap-start
      w-90
      flex items-center justify-between
     rounded-2xl
      bg-secondary-50
      p-6
      shadow-md"
        >
          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-secondary-900">
              نیاز به اجرای یک پروژه دارم
            </h3>
            <p className="text-sm text-secondary-500 leading-relaxed">
              پروژه‌ات رو با بودجه دلخواهت به جامعه‌ای خلاق بسپار و نتیجه بگیر
            </p>
            <button className="bg-primary-800 text-secondary-50 py-1 px-4 rounded-md">
              مشاهده
            </button>
          </div>
          <div
            className="
      w-80
          h-40
          max-w-xs md:max-w-sm
          aspect-square
         "
          >
            <img
              className="h-full w-full object-contain"
              src="Images/find-job.png"
              alt=""
            />
          </div>
        </div>
        <div
          className="    snap-start
      w-90
      flex items-center justify-between
      rounded-2xl
      bg-secondary-50
      p-6
      shadow-md"
        >
          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-secondary-900">
              فرصت شغلی بعدی‌ات رو پیدا کن!
            </h3>
            <p className="text-sm text-secondary-500 leading-relaxed">
              درآمد کسب کن، مشتری پیدا کن و مسیر حرفه‌ای فریلنسری‌ات رو بساز
            </p>
            <button className="bg-primary-800 text-secondary-50 py-1 px-4 rounded-md">
              مشاهده
            </button>
          </div>
          <div
            className="
          flex-1
          w-80
          h-40
          max-w-xs md:max-w-sm
          aspect-square
         "
          >
            <img
              className="h-full w-full object-contain"
              src="Images/need-freelancer.png"
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="p-8 mx-auto text-center space-y-2">
        <p className="md:text-2xl font-bold text-secondary-900">
          دستاوردهای ما
        </p>
        <p className="text-xs md:text-lg text-secondary-500">
          ما در فریلنسر اپ، باور داریم که استعداد مرز نمی‌شناسد و فرصت‌ها هم
          نباید محدود باشند
        </p>
        <section className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 pt-8 gap-5">
          {Achievement.map((arch) => (
            <div
              className={`flex flex-col items-center rounded-lg p-4 shadow-lg border-t-2 bg-secondary-50
                 ${BORDER_COLORS[arch.id] ?? "border-t-transparent"}
              `}
            >
              <div className="aspect-square flex items-center justify-center mb-2">
                <img
                  className="object-contain"
                  src={arch.image_url}
                  alt={arch.title}
                />
              </div>
              <p className="text-secondary-800 font-bold ">
                {toPersianNumbers(arch.numbers)}
              </p>
              <p className=" text-nowrap text-sm lg:text-lg text-secondary-500">
                {arch.title}
              </p>
            </div>
          ))}
        </section>
      </div>

      <footer className="bg-secondary-50 text-secondary-900 mt-16">
        <div className="container xl:max-w-screen-lg px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-extrabold text-primary-900">
              فریلنسر اپ
            </h3>
            <p className="text-sm text-secondary-700 leading-relaxed">
              فریلنسر اپ بستری امن و حرفه‌ای برای ارتباط بین کارفرماها و
              فریلنسرهاست؛ جایی که پروژه‌ها با شفافیت تعریف و با کیفیت اجرا
              می‌شوند.
            </p>

            <div className="flex items-center gap-3">
              <a className="footer-social">
                <FaInstagram />
              </a>
              <a className="footer-social">
                <FaTelegramPlane />
              </a>
              <a
                className="footer-social"
                href="https://www.linkedin.com/in/parisa-adli/"
                target="_blank"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
          <div>
            <h4 className="footer-title">کارفرماها</h4>
            <ul className="footer-list">
              <li>ثبت پروژه</li>
              <li>پیدا کردن فریلنسر</li>
              <li>مدیریت پروژه‌ها</li>
              <li>راهنمای کارفرما</li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">فریلنسرها</h4>
            <ul className="footer-list">
              <li>پیدا کردن پروژه</li>
              <li>ساخت پروفایل</li>
              <li>قوانین همکاری</li>
              <li>راهنمای فریلنسر</li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">پشتیبانی</h4>
            <ul className="footer-list">
              <li>تماس با ما</li>
              <li>سؤالات متداول</li>
              <li>قوانین و مقررات</li>
              <li>حریم خصوصی</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-secondary-300">
          <div className="container xl:max-w-screen-lg px-4 py-4 flex flex-col text-center gap-3 text-xs text-secondary-400">
            <p>
              © {new Date().getFullYear()} FreelancerApp تمام حقوق محفوظ است.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Home;
