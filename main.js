const nunjucks = require('nunjucks');
const toml = require('toml');
const fs = require('fs');
const shell = require('shelljs');

const main = () => {
  if (fs.existsSync('public')) {
    shell.rm('-r', 'public');
  }
  shell.mkdir('public');
  shell.mkdir('public/css');
  shell.mkdir('public/members');

  // copy img
  const imgTable = {
    top: 'JDL_2017.jpg',
    members: 'NF_2017.jpg',
    irai: 'NF_2017_koshihikari.jpg',
  };
  shell.cp('-r', 'img', 'public/img');

  shell.cp('templates/404.html', 'public/404.html');

  const topPage = nunjucks.render('templates/top.html', {imgTable});
  fs.writeFileSync('public/index.html',topPage);

  const years = fs.readdirSync('members').sort().reverse().map(f => f.substr(0,4));
  const active = years.slice(0,4);
  const inactive = years.slice(4);
  const membersPage = nunjucks.render('templates/members.html', {"years": active, imgTable});
  fs.writeFileSync('public/members.html',membersPage);
  active.forEach((year) => {
    const memberData = fs.readFileSync(`members/${year}.toml`);
    let members;
    try {
      members = toml.parse(memberData).members;
    } catch(e) {
      console.error(`Parse Error: ${e.line} in members/${year}.toml`);
      process.exit(1);
    }
    const memberPage = nunjucks.render('templates/member.html', {year, members, imgTable});
    fs.writeFileSync(`public/members/${year}.html`, memberPage);
  });

  const oldMember = inactive.map((year) => {
    const memberData = fs.readFileSync(`members/${year}.toml`);
    let members;
    try {
      members = toml.parse(memberData).members;
    } catch(e) {
      console.error(`Parse Error: ${e.line} in members/${year}.toml`);
      process.exit(1);
    }

    const isLast = year === '2007';
    return {year, members, isLast};
  });
  const oldMemberPage = nunjucks.render('templates/old_member.html', {"data": oldMember, imgTable});
  fs.writeFileSync('public/members/obog.html', oldMemberPage);

  const iraiPage = nunjucks.render('templates/irai.html', {imgTable});
  fs.writeFileSync('public/irai.html',iraiPage);
};

main();
