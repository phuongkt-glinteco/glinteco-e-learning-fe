import subprocess

def run(cmd):
    return subprocess.check_output(cmd, shell=True, text=True).strip()

branches = run("git branch --format='%(refname:short)'").split('\n')
branches = [b.strip() for b in branches if b.strip()]

print(f"Total branches: {len(branches)}")

sha_to_branches = {}
branch_to_sha = {}
for b in branches:
    sha = run(f"git rev-parse {b}")
    sha_to_branches.setdefault(sha, []).append(b)
    branch_to_sha[b] = sha

print("\nUnique commits per branch:")
for sha, bs in sha_to_branches.items():
    print(f"{sha[:8]}: {', '.join(bs)}")

leaf_shas = []
for sha in sha_to_branches:
    is_ancestor_of_other = False
    for other_sha in sha_to_branches:
        if sha == other_sha:
            continue
        res = subprocess.run(f"git merge-base --is-ancestor {sha} {other_sha}", shell=True)
        if res.returncode == 0:
            is_ancestor_of_other = True
            break
    if not is_ancestor_of_other:
        leaf_shas.append(sha)

print("\nLeaf commits (branches to merge):")
for sha in leaf_shas:
    # Get the latest commit message
    msg = run(f"git log -n 1 --oneline {sha}")
    print(f"{sha[:8]} -> {', '.join(sha_to_branches[sha])} | {msg}")
