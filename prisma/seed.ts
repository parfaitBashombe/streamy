import { prisma } from "../src/config/prisma.js";

const creatorId = "6876d80d-de8e-4bb8-868d-6d9089218f62";

const movies = [
  {
    title: "The Matrix",
    overview: "A computer hacker learns about the true nature of reality.",
    release_year: 1999,
    genres: ["Action", "Sci-Fi"],
    runtime: 136,
    poster_url: "https://example.com/matrix.jpg",
    created_by: creatorId,
  },
  {
    title: "Inception",
    overview:
      "A thief who steals corporate secrets through dream-sharing technology.",
    release_year: 2010,
    genres: ["Action", "Sci-Fi", "Thriller"],
    runtime: 148,
    poster_url: "https://example.com/inception.jpg",
    created_by: creatorId,
  },
  {
    title: "The Dark Knight",
    overview: "Batman faces the Joker in a battle for Gotham's soul.",
    release_year: 2008,
    genres: ["Action", "Crime", "Drama"],
    runtime: 152,
    poster_url: "https://example.com/darkknight.jpg",
    created_by: creatorId,
  },
  {
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, and others intertwine.",
    release_year: 1994,
    genres: ["Crime", "Drama"],
    runtime: 154,
    poster_url: "https://example.com/pulpfiction.jpg",
    created_by: creatorId,
  },
  {
    title: "Interstellar",
    overview: "A team of explorers travel through a wormhole in space.",
    release_year: 2014,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    runtime: 169,
    poster_url: "https://example.com/interstellar.jpg",
    created_by: creatorId,
  },
  {
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years.",
    release_year: 1994,
    genres: ["Drama"],
    runtime: 142,
    poster_url: "https://example.com/shawshank.jpg",
    created_by: creatorId,
  },
  {
    title: "Fight Club",
    overview:
      "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
    release_year: 1999,
    genres: ["Drama"],
    runtime: 139,
    poster_url: "https://example.com/fightclub.jpg",
    created_by: creatorId,
  },
  {
    title: "Forrest Gump",
    overview:
      "The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man.",
    release_year: 1994,
    genres: ["Drama", "Romance"],
    runtime: 142,
    poster_url: "https://example.com/forrestgump.jpg",
    created_by: creatorId,
  },
  {
    title: "The Godfather",
    overview:
      "The aging patriarch of an organized crime dynasty transfers control to his son.",
    release_year: 1972,
    genres: ["Crime", "Drama"],
    runtime: 175,
    poster_url: "https://example.com/godfather.jpg",
    created_by: creatorId,
  },
  {
    title: "Goodfellas",
    overview: "The story of Henry Hill and his life in the mob.",
    release_year: 1990,
    genres: ["Biography", "Crime", "Drama"],
    runtime: 146,
    poster_url: "https://example.com/goodfellas.jpg",
    created_by: creatorId,
  },
];

const main = async () => {
  console.log("Seeding movies...");

  for (const movie of movies) {
    await prisma.movie.create({
      data: movie,
    });
    console.log(`Created movie: ${movie.title}`);
  }

  console.log("Seeding completed!");
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
