const createError = require("http-errors");
const JWT = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { UserModel } = require("../app/models/user");
const { CategoryModel } = require("../app/models/category");

function toPersianDigits(n) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

// shared by login and logout, so both set the same flags
function cookieOptions(env = process.env) {
  return {
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
    sameSite: "Lax",
    secure: env.NODE_ENV !== "development",
    domain: env.DOMAIN,
  };
}

async function setAccessToken(res, user) {
  res.cookie(
    "accessToken",
    await generateToken(user, "1d", process.env.ACCESS_TOKEN_SECRET_KEY),
    { ...cookieOptions(), maxAge: 1000 * 60 * 60 * 24 } // 1 day
  );
}

async function setRefreshToken(res, user) {
  res.cookie(
    "refreshToken",
    await generateToken(user, "1y", process.env.REFRESH_TOKEN_SECRET_KEY),
    { ...cookieOptions(), maxAge: 1000 * 60 * 60 * 24 * 365 } // 1 year
  );
}

async function findByIdOr404(Model, id, notFoundMessage) {
  if (!mongoose.isValidObjectId(id))
    throw createError.BadRequest("شناسه ارسال شده صحیح نمیباشد");
  const doc = await Model.findById(id);
  if (!doc) throw createError.NotFound(notFoundMessage);
  return doc;
}

// user input used inside a RegExp must match literally
function escapeRegex(text) {
  return String(text ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createdAtSort(sort) {
  return { createdAt: sort === "latest" ? -1 : 1 };
}

// filter and sort for both project list endpoints, built from req.query
async function buildProjectQuery({ search, category, sort, status }) {
  const filter = {};
  if (search) filter.title = new RegExp(escapeRegex(search), "i");
  if (["OPEN", "CLOSED"].includes(status)) filter.status = { $eq: status };
  if (category && !category.includes("ALL")) {
    const categories = await CategoryModel.find({
      englishTitle: { $in: category.split(",") },
    });
    filter.category = { $in: categories.map((c) => c._id) };
  }
  return { filter, sort: createdAtSort(sort) };
}

function generateToken(user, expiresIn, secret) {
  return new Promise((resolve, reject) => {
    const payload = {
      _id: user._id,
    };

    const options = {
      expiresIn,
    };

    JWT.sign(
      payload,
      secret || process.env.TOKEN_SECRET_KEY,
      options,
      (err, token) => {
        if (err) reject(createError.InternalServerError("خطای سروری"));
        resolve(token);
      }
    );
  });
}
function verifyRefreshToken(req) {
  const refreshToken = req.signedCookies["refreshToken"];
  if (!refreshToken) {
    throw createError.Unauthorized("لطفا وارد حساب کاربری خود شوید.");
  }
  const token = cookieParser.signedCookie(
    refreshToken,
    process.env.COOKIE_PARSER_SECRET_KEY
  );
  return new Promise((resolve, reject) => {
    JWT.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET_KEY,
      async (err, payload) => {
        try {
          if (err)
            reject(createError.Unauthorized("لطفا حساب کاربری خود شوید"));
          const { _id } = payload;
          const user = await UserModel.findById(_id, {
            password: 0,
            otp: 0,
            resetLink: 0,
          });
          if (!user) reject(createError.Unauthorized("حساب کاربری یافت نشد"));
          return resolve(_id);
        } catch {
          reject(createError.Unauthorized("حساب کاربری یافت نشد"));
        }
      }
    );
  });
}

function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}

module.exports = {
  toPersianDigits,
  cookieOptions,
  findByIdOr404,
  escapeRegex,
  createdAtSort,
  buildProjectQuery,
  setAccessToken,
  setRefreshToken,
  verifyRefreshToken,
  copyObject,
};
