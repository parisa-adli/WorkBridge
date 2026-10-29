import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, createLucideIcon } from "lucide-react";
import MainHeader from "../ui/MainHeader";
import Skeleton from "../ui/Skeleton";
import usePublicStats from "../hooks/usePublicStats";
import { categoryName } from "../utils/localized";
import { toPersianNumbers } from "../utils/toPersianNumber";

// lucide 1.x dropped brand icons; this is its former Linkedin icon.
const Linkedin = createLucideIcon("linkedin", [
  ["path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z", key: "c2jq9f" }],
  ["rect", { width: "4", height: "12", x: "2", y: "9", key: "mk3on5" }],
  ["circle", { cx: "4", cy: "4", r: "2", key: "bt5ra8" }],
]);

// Images exist only for these englishTitles; other categories get the generic projects icon.
const CATEGORY_IMAGES = ["development", "design", "marketing", "writing", "music", "video", "architecture", "finance"];
const categoryImage = (englishTitle: string) =>
  CATEGORY_IMAGES.includes(englishTitle) ? `Images/categories/${englishTitle}.svg` : "Images/projects.svg";

const ACHIEVEMENTS = [
  { key: "freelancers", image_url: "Images/freelancer.svg", border: "border-t-[#FFDB7D]" },
  { key: "owners", image_url: "Images/companies.svg", border: "border-t-[#FFDAD3]" },
  { key: "openProjects", image_url: "Images/projects.svg", border: "border-t-[#D0E1FF]" },
] as const;

function Home() {
  const { t } = useTranslation();
  const { stats, isLoading } = usePublicStats();
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
        <section
          aria-busy={isLoading}
          className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 pt-8 gap-5">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20 w-full" />)
            : stats?.categories.map((category) => (
                <Link
                  to="/auth"
                  key={category._id}
                  className="grid grid-cols-4 items-center p-3 border rounded-lg  gap-x-2">
                  <div className="col-span-1 aspect-square shrink-0  min-w-10">
                    <img
                      className="object-contain w-full h-full"
                      src={categoryImage(category.englishTitle)}
                      alt=""
                    />
                  </div>
                  <p className="col-span-3 flex flex-col items-start gap-2 text-nowrap text-sm lg:text-lg text-secondary-800">
                    {categoryName(category)}
                    <span className="flex items-center gap-x-2 text-secondary-400 text-xs ">
                      {t("home.projectsCount", { n: toPersianNumbers(category.projects) })} <ArrowLeft className="size-3 ltr:-scale-x-100" />
                    </span>
                  </p>
                </Link>
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
            <Link to="/auth" className="inline-block bg-primary-800 text-secondary-50 py-1 px-4 rounded-md">
              {t("home.view")}
            </Link>
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
            <Link to="/auth" className="inline-block bg-primary-800 text-secondary-50 py-1 px-4 rounded-md">
              {t("home.view")}
            </Link>
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
        <section
          aria-busy={isLoading}
          className="grid xs:grid-cols-2 sm:grid-cols-3 pt-8 gap-5">
          {ACHIEVEMENTS.map((arch) => (
            <div
              key={arch.key}
              className={`flex flex-col items-center rounded-lg p-4 shadow-lg border-t-2 bg-secondary-50
                 ${arch.border}
              `}
            >
              <div className="aspect-square flex items-center justify-center mb-2">
                <img
                  className="object-contain"
                  src={arch.image_url}
                  alt=""
                />
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <p className="text-secondary-800 font-bold ">
                  {toPersianNumbers(stats?.[arch.key] ?? 0)}
                </p>
              )}
              <p className=" text-nowrap text-sm lg:text-lg text-secondary-500">
                {t(`home.stats.${arch.key}`)}
              </p>
            </div>
          ))}
        </section>
      </div>

      <footer className="bg-secondary-50 text-secondary-900 mt-16">
        <div className="container xl:max-w-(--breakpoint-lg) px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-extrabold text-primary-900">
              {t("app.name")}
            </h3>
            <p className="text-sm text-secondary-700 leading-relaxed">
              {t("home.footerText")}
            </p>

            <div className="flex items-center gap-3">
              <a
                className="footer-social"
                href="https://www.linkedin.com/in/parisa-adli/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="footer-title">{t("home.footer.clients")}</h4>
            <ul className="footer-list">
              <li><Link to="/auth">{t("home.footer.postProject")}</Link></li>
              <li><Link to="/auth">{t("home.footer.manageProjects")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">{t("home.footer.freelancers")}</h4>
            <ul className="footer-list">
              <li><Link to="/auth">{t("home.footer.findProject")}</Link></li>
              <li><Link to="/auth">{t("home.footer.buildProfile")}</Link></li>
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
