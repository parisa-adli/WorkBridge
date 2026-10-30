import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, CircleAlert, createLucideIcon, FolderOpen } from "lucide-react";
import MainHeader from "../ui/MainHeader";
import Skeleton from "../ui/Skeleton";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { buttonClass } from "../ui/Button";
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
  { key: "freelancers", image_url: "Images/freelancer.svg" },
  { key: "owners", image_url: "Images/companies.svg" },
  { key: "openProjects", image_url: "Images/projects.svg" },
] as const;

const PROMOS = [
  { key: "needProject", image_url: "Images/find-job.png" },
  { key: "findJob", image_url: "Images/need-freelancer.png" },
] as const;

const FOOTER_LINKS = [
  { key: "clients", links: ["postProject", "manageProjects"] },
  { key: "freelancers", links: ["findProject", "buildProfile"] },
] as const;

const CATEGORY_GRID = "grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 pt-8 gap-5";

function Home() {
  const { t } = useTranslation();
  const { stats, isLoading, isError } = usePublicStats();

  const renderCategories = () => {
    if (isLoading)
      return (
        <section aria-busy="true" className={CATEGORY_GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </section>
      );
    if (isError && !stats)
      return <EmptyState icon={<CircleAlert className="text-destructive" />} title={t("home.statsError")} />;
    if (!stats?.categories.length) return <EmptyState icon={<FolderOpen />} title={t("home.noCategories")} />;
    return (
      <section className={CATEGORY_GRID}>
        {stats.categories.map((category) => (
          <Link
            to="/auth"
            key={category._id}
            className="grid grid-cols-4 items-center gap-x-2 rounded-xl border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:bg-accent"
          >
            <div className="col-span-1 aspect-square shrink-0 min-w-10">
              <img className="object-contain w-full h-full" src={categoryImage(category.englishTitle)} alt="" />
            </div>
            <p className="col-span-3 flex flex-col items-start gap-2 text-nowrap text-sm lg:text-lg">
              {categoryName(category)}
              <span className="flex items-center gap-x-2 text-muted-foreground text-xs">
                {t("home.projectsCount", { n: toPersianNumbers(category.projects) })}{" "}
                <ArrowLeft className="size-3 ltr:-scale-x-100" />
              </span>
            </p>
          </Link>
        ))}
      </section>
    );
  };

  return (
    <div className="bg-background text-foreground">
      <MainHeader />
      <div className="bg-muted w-full">
        <div className="container xl:max-w-(--breakpoint-lg)">
          <div className="p-4 text-xl grid grid-cols-1 md:grid-cols-[1fr_2fr] md:gap-x-8">
            <div className="space-y-4 md:space-y-8 my-4 md:mt-10">
              <div>
                <h1 className="font-extrabold text-3xl md:text-5xl">{t("app.name")}</h1>
                <h3 className="mt-3 text-xl md:text-3xl font-bold text-muted-foreground sm:text-nowrap">
                  {t("home.subtitle")}
                </h3>
              </div>
              <p className="text-justify leading-relaxed text-sm md:text-lg md:leading-7">{t("home.intro")}</p>
            </div>
            <div className="max-w-xl mt-8">
              <img src="Images/freelancer.png" alt="freelancer-home" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-8 mx-auto text-center space-y-2">
        <p className="md:text-2xl font-bold">{t("home.popularCategories")}</p>
        <p className="text-xs md:text-lg text-muted-foreground">{t("home.skillsCount")}</p>
        {renderCategories()}
      </div>
      <div className="lg:p-8 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible">
        {PROMOS.map(({ key, image_url }) => (
          <Card key={key} className="snap-start flex-row items-center justify-between p-6">
            <div className="space-y-2">
              <h3 className="text-base md:text-lg font-semibold">{t(`home.${key}Title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`home.${key}Text`)}</p>
              <Link to="/auth" className={buttonClass({ size: "sm" })}>
                {t("home.view")}
              </Link>
            </div>
            <div className="w-80 h-40 max-w-xs md:max-w-sm aspect-square">
              <img className="h-full w-full object-contain" src={image_url} alt="" />
            </div>
          </Card>
        ))}
      </div>
      <div className="p-8 mx-auto text-center space-y-2">
        <p className="md:text-2xl font-bold">{t("home.achievements")}</p>
        <p className="text-xs md:text-lg text-muted-foreground">{t("home.achievementsText")}</p>
        <section aria-busy={isLoading} className="grid xs:grid-cols-2 sm:grid-cols-3 pt-8 gap-5">
          {ACHIEVEMENTS.map((arch) => (
            <Card key={arch.key} className="items-center gap-2 p-4">
              <div className="aspect-square flex items-center justify-center">
                <img className="object-contain" src={arch.image_url} alt="" />
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                stats && <p className="font-bold">{toPersianNumbers(stats[arch.key] ?? 0)}</p>
              )}
              <p className="text-nowrap text-sm lg:text-lg text-muted-foreground">{t(`home.stats.${arch.key}`)}</p>
            </Card>
          ))}
        </section>
      </div>

      <footer className="bg-muted mt-16">
        <div className="container xl:max-w-(--breakpoint-lg) px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-extrabold">{t("app.name")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("home.footerText")}</p>
            <div className="flex items-center gap-3">
              <a
                className={buttonClass({ variant: "outline", size: "icon" })}
                href="https://www.linkedin.com/in/parisa-adli/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>
          {FOOTER_LINKS.map(({ key, links }) => (
            <div key={key}>
              <h4 className="mb-3 font-semibold">{t(`home.footer.${key}`)}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {links.map((link) => (
                  <li key={link}>
                    <Link to="/auth" className="hover:text-foreground hover:underline">
                      {t(`home.footer.${link}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t">
          <div className="container xl:max-w-(--breakpoint-lg) px-4 py-4 flex flex-col text-center gap-3 text-xs text-muted-foreground">
            <p>{t("home.copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Home;
