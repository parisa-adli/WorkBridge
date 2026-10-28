import { useTranslation } from "react-i18next";
import { HiArrowLeft } from "react-icons/hi";
import MainHeader from "../ui/MainHeader";
import { toPersianNumbers } from "../utils/toPersianNumber";
import {
  FaInstagram,
  FaTelegramPlane,
  FaLinkedin,
} from "react-icons/fa";

const categories = [
  {
    id: 1,
    title: "home.categories.development",
    skills: 985,
    image_url: "Images/categories/development.svg",
  },
  {
    id: 2,
    title: "home.categories.design",
    skills: 515,
    image_url: "Images/categories/design.svg",
  },
  {
    id: 3,
    title: "home.categories.marketing",
    skills: 486,
    image_url: "Images/categories/marketing.svg",
  },
  {
    id: 4,
    title: "home.categories.writing",
    skills: 1118,
    image_url: "Images/categories/writing.svg",
  },
  {
    id: 5,
    title: "home.categories.music",
    skills: 567,
    image_url: "Images/categories/music.svg",
  },
  {
    id: 6,
    title: "home.categories.video",
    skills: 231,
    image_url: "Images/categories/video.svg",
  },
  {
    id: 7,
    title: "home.categories.architecture",
    skills: 732,
    image_url: "Images/categories/Architecture.svg",
  },
  {
    id: 8,
    title: "home.categories.finance",
    skills: 963,
    image_url: "Images/categories/Finance.svg",
  },
];
const Achievement = [
  {
    id: 1,
    title: "home.stats.freelancers",
    numbers: 7423,
    image_url: "Images/freelancer.svg",
  },
  {
    id: 2,
    title: "home.stats.postedProjects",
    numbers: 8325,
    image_url: "Images/projects.svg",
  },
  {
    id: 3,
    title: "home.stats.completedProjects",
    numbers: 6274,
    image_url: "Images/completed.svg",
  },
  {
    id: 4,
    title: "home.stats.companies",
    numbers: 3560,
    image_url: "Images/companies.svg",
  },
];
const BORDER_COLORS: Record<number, string> = {
  1: "border-t-[#FFDB7D]",
  2: "border-t-[#FFDAD3]",
  3: "border-t-[#D0E1FF]",
  4: "border-t-[#DAF3E1]",
};

function Home() {
  const { t } = useTranslation();
  return (
    <div className="bg-secondary-0">
      <MainHeader />
      <div className="bg-primary-100 w-full">
        <div className="container xl:max-w-(--breakpoint-lg)">
          <div className="p-4 text-xl text-gray-700 grid grid-cols-1 md:grid-cols-[1fr_2fr] md:gap-x-8">
            <div className="space-y-4 md:space-y-8 my-4 md:mt-10">
              <div>
                <h1 className="font-extrabold text-3xl md:text-5xl ">
                  {t("app.name")}
                </h1>
                <h3 className="mt-3 text-xl md:text-3xl font-bold text-primary-900 sm:text-nowrap">
                  {t("home.subtitle")}
                </h3>
              </div>
              <p className="text-justify leading-relaxed text-sm md:text-lg md:leading-7">
                {t("home.intro")}
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
          {t("home.popularCategories")}
        </p>
        <p className="text-xs md:text-lg text-secondary-500">
          {t("home.skillsCount")}
        </p>
        <section className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 pt-8 gap-5">
          {categories.map((category) => (
            <div
              key={category.id}
              className="grid grid-cols-4 items-center p-3 border rounded-lg  gap-x-2">
              <div className="col-span-1 aspect-square shrink-0  min-w-10">
                <img
                  className="object-contain w-full h-full"
                  src={category.image_url}
                  alt={t(category.title)}
                />
              </div>
              <p className="col-span-3 flex flex-col items-start gap-2 text-nowrap text-sm lg:text-lg text-secondary-800">
                {t(category.title)}
                <span className="flex items-center gap-x-2 text-secondary-400 text-xs ">
                  {t("home.projectsCount", { n: toPersianNumbers(category.skills) })} <HiArrowLeft className="ltr:-scale-x-100" />
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
      flex items-center justify-between
     rounded-2xl
      bg-secondary-50
      p-6
      shadow-md"
        >
          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-secondary-900">
              {t("home.needProjectTitle")}
            </h3>
            <p className="text-sm text-secondary-500 leading-relaxed">
              {t("home.needProjectText")}
            </p>
            <button className="bg-primary-800 text-secondary-50 py-1 px-4 rounded-md">
              {t("home.view")}
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
      flex items-center justify-between
      rounded-2xl
      bg-secondary-50
      p-6
      shadow-md"
        >
          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-secondary-900">
              {t("home.findJobTitle")}
            </h3>
            <p className="text-sm text-secondary-500 leading-relaxed">
              {t("home.findJobText")}
            </p>
            <button className="bg-primary-800 text-secondary-50 py-1 px-4 rounded-md">
              {t("home.view")}
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
          {t("home.achievements")}
        </p>
        <p className="text-xs md:text-lg text-secondary-500">
          {t("home.achievementsText")}
        </p>
        <section className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 pt-8 gap-5">
          {Achievement.map((arch) => (
            <div
              key={arch.id}
              className={`flex flex-col items-center rounded-lg p-4 shadow-lg border-t-2 bg-secondary-50
                 ${BORDER_COLORS[arch.id] ?? "border-t-transparent"}
              `}
            >
              <div className="aspect-square flex items-center justify-center mb-2">
                <img
                  className="object-contain"
                  src={arch.image_url}
                  alt={t(arch.title)}
                />
              </div>
              <p className="text-secondary-800 font-bold ">
                {toPersianNumbers(arch.numbers)}
              </p>
              <p className=" text-nowrap text-sm lg:text-lg text-secondary-500">
                {t(arch.title)}
              </p>
            </div>
          ))}
        </section>
      </div>

      <footer className="bg-secondary-50 text-secondary-900 mt-16">
        <div className="container xl:max-w-(--breakpoint-lg) px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-extrabold text-primary-900">
              {t("app.name")}
            </h3>
            <p className="text-sm text-secondary-700 leading-relaxed">
              {t("home.footerText")}
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
                rel="noreferrer"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
          <div>
            <h4 className="footer-title">{t("home.footer.clients")}</h4>
            <ul className="footer-list">
              <li>{t("home.footer.postProject")}</li>
              <li>{t("home.footer.findFreelancer")}</li>
              <li>{t("home.footer.manageProjects")}</li>
              <li>{t("home.footer.clientGuide")}</li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">{t("home.footer.freelancers")}</h4>
            <ul className="footer-list">
              <li>{t("home.footer.findProject")}</li>
              <li>{t("home.footer.buildProfile")}</li>
              <li>{t("home.footer.rules")}</li>
              <li>{t("home.footer.freelancerGuide")}</li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">{t("home.footer.support")}</h4>
            <ul className="footer-list">
              <li>{t("home.footer.contact")}</li>
              <li>{t("home.footer.faq")}</li>
              <li>{t("home.footer.terms")}</li>
              <li>{t("home.footer.privacy")}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-secondary-300">
          <div className="container xl:max-w-(--breakpoint-lg) px-4 py-4 flex flex-col text-center gap-3 text-xs text-secondary-400">
            <p>
              {t("home.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Home;
